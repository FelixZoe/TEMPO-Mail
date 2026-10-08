import Foundation

enum JMAPError: LocalizedError {
    case invalidResponse
    case httpStatus(Int)
    case protocolError(type: String, description: String?)
    case missingCapability(String)
    case missingMailbox(String)
    case missingIdentity
    case creationFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse: "邮件服务器返回了无法识别的数据"
        case .httpStatus(let status): "邮件服务器请求失败（HTTP \(status)）"
        case .protocolError(let type, let description): description ?? "JMAP 错误：\(type)"
        case .missingCapability(let capability): "服务器不支持所需能力：\(capability)"
        case .missingMailbox(let role): "服务器缺少 \(role) 邮箱"
        case .missingIdentity: "服务器没有可用于发信的身份"
        case .creationFailed(let reason): "邮件创建失败：\(reason)"
        }
    }
}

actor JMAPClient {
    private let account: MailAccount
    private let password: String
    private let session: URLSession

    init(account: MailAccount, password: String, session: URLSession = .shared) {
        self.account = account
        self.password = password
        self.session = session
    }

    static func discover(
        endpoint: URL,
        username: String,
        password: String,
        session: URLSession = .shared
    ) async throws -> JMAPSession {
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        request.setValue(basicAuthorization(username: username, password: password), forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await session.data(for: request)
        try validate(response: response)
        return try decoder.decode(JMAPSession.self, from: data)
    }

    func fetchMailboxes() async throws -> [Mailbox] {
        let arguments: JSONValue = .object([
            "accountId": .string(account.jmapAccountID),
            "properties": .array([
                "id", "name", "parentId", "role", "sortOrder", "totalEmails", "unreadEmails"
            ].map(JSONValue.string))
        ])
        let response: JMAPGetResponse<Mailbox> = try await perform(
            method: "Mailbox/get",
            capabilities: [JMAPCapability.core, JMAPCapability.mail],
            arguments: arguments
        )
        return response.list.sorted {
            if $0.sortOrder == $1.sortOrder { return $0.name.localizedCompare($1.name) == .orderedAscending }
            return $0.sortOrder < $1.sortOrder
        }
    }

    func fetchMessages(scope: MailScope, searchText: String, limit: Int) async throws -> [MailMessage] {
        let mailboxes = try await fetchMailboxes()
        var filter: [String: JSONValue] = [:]
        switch scope {
        case .inbox:
            guard let mailbox = mailboxes.first(where: { $0.role == "inbox" }) else {
                throw JMAPError.missingMailbox("收件箱")
            }
            filter["inMailbox"] = .string(mailbox.id)
        case .starred:
            filter["hasKeyword"] = .string("$flagged")
        case .sent:
            guard let mailbox = mailboxes.first(where: { $0.role == "sent" }) else {
                throw JMAPError.missingMailbox("已发送")
            }
            filter["inMailbox"] = .string(mailbox.id)
        }

        let cleanedSearch = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        if !cleanedSearch.isEmpty { filter["text"] = .string(cleanedSearch) }

        let queryArguments: JSONValue = .object([
            "accountId": .string(account.jmapAccountID),
            "filter": .object(filter),
            "sort": .array([
                .object(["property": .string("receivedAt"), "isAscending": .bool(false)])
            ]),
            "position": .integer(0),
            "limit": .integer(min(max(limit, 10), 100)),
            "calculateTotal": .bool(true)
        ])
        let query: EmailQueryResponse = try await perform(
            method: "Email/query",
            capabilities: [JMAPCapability.core, JMAPCapability.mail],
            arguments: queryArguments
        )
        guard !query.ids.isEmpty else { return [] }

        let properties = [
            "id", "blobId", "threadId", "mailboxIds", "keywords", "size", "receivedAt", "sentAt",
            "from", "to", "subject", "preview", "hasAttachment", "textBody", "bodyValues"
        ]
        let getArguments: JSONValue = .object([
            "accountId": .string(account.jmapAccountID),
            "ids": .array(query.ids.map(JSONValue.string)),
            "properties": .array(properties.map(JSONValue.string)),
            "fetchTextBodyValues": .bool(true),
            "maxBodyValueBytes": .integer(1_000_000)
        ])
        let messages: JMAPGetResponse<MailMessage> = try await perform(
            method: "Email/get",
            capabilities: [JMAPCapability.core, JMAPCapability.mail],
            arguments: getArguments
        )
        let order = Dictionary(uniqueKeysWithValues: query.ids.enumerated().map { offset, id in (id, offset) })
        return messages.list.sorted { order[$0.id, default: .max] < order[$1.id, default: .max] }
    }

    func markRead(messageID: String) async throws {
        let arguments: JSONValue = .object([
            "accountId": .string(account.jmapAccountID),
            "update": .object([
                messageID: .object(["keywords/$seen": .bool(true)])
            ])
        ])
        let response: JMAPSetResponse = try await perform(
            method: "Email/set",
            capabilities: [JMAPCapability.core, JMAPCapability.mail],
            arguments: arguments
        )
        if let error = response.notUpdated?[messageID] {
            throw JMAPError.protocolError(type: error.type, description: error.description)
        }
    }

    func send(_ draft: ComposeDraft) async throws {
        let mailboxes = try await fetchMailboxes()
        guard let draftsMailbox = mailboxes.first(where: { $0.role == "drafts" }) else {
            throw JMAPError.missingMailbox("草稿箱")
        }
        guard let sentMailbox = mailboxes.first(where: { $0.role == "sent" }) else {
            throw JMAPError.missingMailbox("已发送")
        }
        let identities: JMAPGetResponse<Identity> = try await perform(
            method: "Identity/get",
            capabilities: [JMAPCapability.core, JMAPCapability.submission],
            arguments: .object(["accountId": .string(account.jmapAccountID)])
        )
        guard let identity = identities.list.first(where: { $0.email.caseInsensitiveCompare(account.emailAddress) == .orderedSame })
                ?? identities.list.first else {
            throw JMAPError.missingIdentity
        }

        let recipients = try parseRecipients(draft.to)
        let clientID = "draft"
        let email: JSONValue = .object([
            "mailboxIds": .object([draftsMailbox.id: .bool(true)]),
            "keywords": .object(["$draft": .bool(true), "$seen": .bool(true)]),
            "from": .array([.object(["name": .string(identity.name), "email": .string(identity.email)])]),
            "to": .array(recipients.map { .object(["email": .string($0)]) }),
            "subject": .string(draft.subject),
            "bodyValues": .object([
                "body": .object(["value": .string(draft.body), "isTruncated": .bool(false)])
            ]),
            "textBody": .array([
                .object(["partId": .string("body"), "type": .string("text/plain")])
            ])
        ])
        let emailSet: JMAPSetResponse = try await perform(
            method: "Email/set",
            capabilities: [JMAPCapability.core, JMAPCapability.mail],
            arguments: .object([
                "accountId": .string(account.jmapAccountID),
                "create": .object([clientID: email])
            ])
        )
        if let error = emailSet.notCreated?[clientID] {
            throw JMAPError.protocolError(type: error.type, description: error.description)
        }
        guard let created = emailSet.created?[clientID]?.objectValue,
              let emailID = created["id"]?.stringValue else {
            throw JMAPError.creationFailed("服务器未返回邮件 ID")
        }

        let submissionID = "send"
        let submissionSet: JMAPSetResponse = try await perform(
            method: "EmailSubmission/set",
            capabilities: [JMAPCapability.core, JMAPCapability.mail, JMAPCapability.submission],
            arguments: .object([
                "accountId": .string(account.jmapAccountID),
                "create": .object([
                    submissionID: .object([
                        "identityId": .string(identity.id),
                        "emailId": .string(emailID)
                    ])
                ]),
                "onSuccessUpdateEmail": .object([
                    "#\(submissionID)": .object([
                        "mailboxIds/\(jsonPointerSegment(draftsMailbox.id))": .null,
                        "mailboxIds/\(jsonPointerSegment(sentMailbox.id))": .bool(true),
                        "keywords/$draft": .null,
                        "keywords/$seen": .bool(true)
                    ])
                ])
            ])
        )
        if let error = submissionSet.notCreated?[submissionID] {
            throw JMAPError.protocolError(type: error.type, description: error.description)
        }
    }

    private func perform<Payload: Decodable>(
        method: String,
        capabilities: [String],
        arguments: JSONValue
    ) async throws -> Payload {
        let callID = "c0"
        let body: JSONValue = .object([
            "using": .array(capabilities.map(JSONValue.string)),
            "methodCalls": .array([
                .array([.string(method), arguments, .string(callID)])
            ])
        ])
        var request = URLRequest(url: account.apiURL)
        request.httpMethod = "POST"
        request.httpBody = try Self.encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(Self.basicAuthorization(username: account.username, password: password), forHTTPHeaderField: "Authorization")

        let (data, response) = try await session.data(for: request)
        try Self.validate(response: response)
        let root = try Self.decoder.decode(JSONValue.self, from: data)
        guard let object = root.objectValue,
              let first = object["methodResponses"]?.arrayValue?.first?.arrayValue,
              first.count >= 2,
              let responseName = first[0].stringValue else {
            throw JMAPError.invalidResponse
        }
        if responseName == "error" {
            let errorObject = first[1].objectValue
            throw JMAPError.protocolError(
                type: errorObject?["type"]?.stringValue ?? "unknown",
                description: errorObject?["description"]?.stringValue
            )
        }
        guard responseName == method else { throw JMAPError.invalidResponse }
        let payloadData = try Self.encoder.encode(first[1])
        return try Self.decoder.decode(Payload.self, from: payloadData)
    }

    private func parseRecipients(_ value: String) throws -> [String] {
        let recipients = value
            .split(whereSeparator: { $0 == "," || $0 == ";" })
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        guard !recipients.isEmpty else { throw ServerPolicyError.invalidEmail }
        for recipient in recipients { try ServerPolicy.validateEmail(recipient) }
        return recipients
    }

    private func jsonPointerSegment(_ value: String) -> String {
        value.replacingOccurrences(of: "~", with: "~0").replacingOccurrences(of: "/", with: "~1")
    }

    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        return encoder
    }()

    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let value = try container.decode(String.self)
            let fractional = ISO8601DateFormatter()
            fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = fractional.date(from: value) { return date }
            let standard = ISO8601DateFormatter()
            standard.formatOptions = [.withInternetDateTime]
            if let date = standard.date(from: value) { return date }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid RFC3339 date")
        }
        return decoder
    }()

    private static func basicAuthorization(username: String, password: String) -> String {
        let credentials = Data("\(username):\(password)".utf8).base64EncodedString()
        return "Basic \(credentials)"
    }

    private static func validate(response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else { throw JMAPError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else { throw JMAPError.httpStatus(http.statusCode) }
    }
}
