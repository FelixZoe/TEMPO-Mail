import Foundation

enum AdministrationError: LocalizedError {
    case invalidServerURL
    case invalidResponse
    case forbidden
    case operationFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidServerURL: "无法从邮件地址确定管理接口"
        case .invalidResponse: "管理接口返回了无法识别的数据"
        case .forbidden: "当前邮箱没有执行此管理操作的权限"
        case .operationFailed(let message): message
        }
    }
}

actor AdministrationClient {
    private struct MethodResponse: Sendable {
        let name: String
        let arguments: JSONValue
        let callID: String
    }

    private let account: MailAccount
    private let password: String
    private let session: URLSession

    init(account: MailAccount, password: String, session: URLSession = NetworkSession.make()) {
        self.account = account
        self.password = password
        self.session = session
    }

    func fetchAccess() async throws -> AdministrationAccess {
        let url = try endpoint(path: "/api/account")
        let data = try await data(for: request(url: url, method: "GET"))
        return try Self.decoder.decode(AdministrationAccess.self, from: data)
    }

    func fetchAccounts(searchText: String = "") async throws -> [ManagedAccount] {
        var filter: [String: JSONValue] = [:]
        let cleaned = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        if !cleaned.isEmpty { filter["text"] = .string(cleaned) }
        let list = try await queryAndGet(
            object: "x:Account",
            filter: .object(filter),
            properties: [
                "id", "@type", "name", "domainId", "emailAddress", "description",
                "createdAt", "usedDiskQuota", "permissions"
            ]
        )
        return list.compactMap(ManagedAccount.init(json:)).filter(\.isUser).sorted {
            $0.emailAddress.localizedCaseInsensitiveCompare($1.emailAddress) == .orderedAscending
        }
    }

    func fetchDomains() async throws -> [ManagedDomain] {
        let list = try await queryAndGet(
            object: "x:Domain",
            filter: .object([:]),
            properties: ["id", "name"]
        )
        return list.compactMap(ManagedDomain.init(json:)).sorted {
            $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending
        }
    }

    func createAccount(_ draft: ManagedAccountDraft) async throws {
        let localPart = draft.localPart.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let displayName = draft.displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !localPart.isEmpty, !draft.domainID.isEmpty, !draft.password.isEmpty else {
            throw AdministrationError.operationFailed("请填写账户名、域名和初始密码")
        }

        var body: [String: JSONValue] = [
            "@type": .string("User"),
            "name": .string(localPart),
            "domainId": .string(draft.domainID),
            "credentials": .object([
                "0": .object(["@type": .string("Password"), "secret": .string(draft.password)])
            ]),
            "memberGroupIds": .object([:]),
            "roles": .object(["@type": .string("User")]),
            "permissions": .object(["@type": .string("Inherit")]),
            "quotas": .object([:]),
            "aliases": .object([:]),
            "encryptionAtRest": .object(["@type": .string("Disabled")])
        ]
        if !displayName.isEmpty { body["description"] = .string(displayName) }
        try await set(
            object: "x:Account",
            arguments: .object(["create": .object(["new-account": .object(body)])]),
            errorBucket: "notCreated"
        )
    }

    func setSuspended(_ suspended: Bool, account managedAccount: ManagedAccount) async throws {
        try await set(
            object: "x:Account",
            arguments: .object([
                "update": .object([
                    managedAccount.id: .object([
                        "permissions": managedAccount.permissionsSetting(authenticationDisabled: suspended)
                    ])
                ])
            ]),
            errorBucket: "notUpdated"
        )
    }

    func deleteAccount(id: String) async throws {
        try await set(
            object: "x:Account",
            arguments: .object(["destroy": .array([.string(id)])]),
            errorBucket: "notDestroyed"
        )
    }

    func fetchTemporaryAddresses() async throws -> [TemporaryAddress] {
        let list = try await queryAndGet(
            object: "x:MaskedEmail",
            filter: .object([:]),
            properties: [
                "id", "accountId", "email", "description", "forDomain", "createdAt", "expiresAt", "enabled"
            ]
        )
        return list.compactMap(TemporaryAddress.init(json:)).sorted {
            ($0.createdAt ?? .distantPast) > ($1.createdAt ?? .distantPast)
        }
    }

    func createTemporaryAddress(_ draft: TemporaryAddressDraft) async throws {
        var body: [String: JSONValue] = [:]
        let prefix = draft.prefix.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let domain = draft.domain.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let description = draft.description.trimmingCharacters(in: .whitespacesAndNewlines)
        let forDomain = draft.forDomain.trimmingCharacters(in: .whitespacesAndNewlines)
        if !prefix.isEmpty { body["emailPrefix"] = .string(prefix) }
        if !domain.isEmpty { body["emailDomain"] = .string(domain) }
        if !description.isEmpty { body["description"] = .string(description) }
        if !forDomain.isEmpty { body["forDomain"] = .string(forDomain) }

        try await set(
            object: "x:MaskedEmail",
            arguments: .object(["create": .object(["new-masked-email": .object(body)])]),
            errorBucket: "notCreated"
        )
    }

    func setTemporaryAddress(_ address: TemporaryAddress, enabled: Bool) async throws {
        try await set(
            object: "x:MaskedEmail",
            arguments: .object([
                "update": .object([address.id: .object(["enabled": .bool(enabled)])])
            ]),
            errorBucket: "notUpdated"
        )
    }

    func deleteTemporaryAddress(id: String) async throws {
        try await set(
            object: "x:MaskedEmail",
            arguments: .object(["destroy": .array([.string(id)])]),
            errorBucket: "notDestroyed"
        )
    }

    private func queryAndGet(
        object: String,
        filter: JSONValue,
        properties: [String]
    ) async throws -> [JSONValue] {
        let responses = try await perform(methodCalls: [
            .array([
                .string("\(object)/query"),
                .object(["filter": filter, "limit": .integer(200), "calculateTotal": .bool(true)]),
                .string("query")
            ]),
            .array([
                .string("\(object)/get"),
                .object([
                    "#ids": .object([
                        "resultOf": .string("query"),
                        "name": .string("\(object)/query"),
                        "path": .string("/ids")
                    ]),
                    "properties": .array(properties.map(JSONValue.string))
                ]),
                .string("get")
            ])
        ])
        guard let get = responses.first(where: { $0.name == "\(object)/get" }),
              let list = get.arguments.objectValue?["list"]?.arrayValue else {
            try throwProtocolError(from: responses)
            throw AdministrationError.invalidResponse
        }
        return list
    }

    private func set(object: String, arguments: JSONValue, errorBucket: String) async throws {
        let responses = try await perform(methodCalls: [
            .array([.string("\(object)/set"), arguments, .string("set")])
        ])
        try throwProtocolError(from: responses)
        guard let response = responses.first(where: { $0.name == "\(object)/set" }),
              let result = response.arguments.objectValue else {
            throw AdministrationError.invalidResponse
        }
        if let errors = result[errorBucket]?.objectValue,
           let first = errors.values.first?.objectValue {
            throw AdministrationError.operationFailed(
                first["description"]?.stringValue ?? first["type"]?.stringValue ?? "管理操作失败"
            )
        }
    }

    private func perform(methodCalls: [JSONValue]) async throws -> [MethodResponse] {
        let body: JSONValue = .object([
            "using": .array([
                .string(JMAPCapability.core),
                .string(JMAPCapability.management)
            ]),
            "methodCalls": .array(methodCalls)
        ])
        let encoded = try Self.encoder.encode(body)
        let candidates = try managementEndpoints()
        var lastError: Error?

        for (index, url) in candidates.enumerated() {
            do {
                var request = request(url: url, method: "POST")
                request.httpBody = encoded
                let data = try await data(for: request)
                let root = try Self.decoder.decode(JSONValue.self, from: data)
                guard let rawResponses = root.objectValue?["methodResponses"]?.arrayValue else {
                    throw AdministrationError.invalidResponse
                }
                return try rawResponses.map { raw in
                    guard let parts = raw.arrayValue,
                          parts.count >= 3,
                          let name = parts[0].stringValue,
                          let callID = parts[2].stringValue else {
                        throw AdministrationError.invalidResponse
                    }
                    return MethodResponse(name: name, arguments: parts[1], callID: callID)
                }
            } catch JMAPError.httpStatus(let status) where index < candidates.count - 1 && (status == 404 || status == 405) {
                lastError = JMAPError.httpStatus(status)
                continue
            } catch {
                throw error
            }
        }
        throw lastError ?? AdministrationError.invalidResponse
    }

    private func throwProtocolError(from responses: [MethodResponse]) throws {
        guard let response = responses.first(where: { $0.name == "error" }) else { return }
        let object = response.arguments.objectValue
        let type = object?["type"]?.stringValue ?? "unknown"
        let description = object?["description"]?.stringValue
        if type.lowercased().contains("forbidden") { throw AdministrationError.forbidden }
        throw JMAPError.protocolError(type: type, description: description)
    }

    private func managementEndpoints() throws -> [URL] {
        let preferred = try endpoint(path: "/api")
        return preferred == account.apiURL ? [preferred] : [preferred, account.apiURL]
    }

    private func endpoint(path: String) throws -> URL {
        guard var components = URLComponents(url: account.sessionURL, resolvingAgainstBaseURL: false) else {
            throw AdministrationError.invalidServerURL
        }
        components.path = path
        components.query = nil
        components.fragment = nil
        guard let url = components.url else { throw AdministrationError.invalidServerURL }
        return url
    }

    private func request(url: URL, method: String) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(Self.basicAuthorization(username: account.username, password: password), forHTTPHeaderField: "Authorization")
        return request
    }

    private func data(for request: URLRequest) async throws -> Data {
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw AdministrationError.invalidResponse }
        if http.statusCode == 401 || http.statusCode == 403 { throw AdministrationError.forbidden }
        guard (200..<300).contains(http.statusCode) else { throw JMAPError.httpStatus(http.statusCode) }
        return data
    }

    private static func basicAuthorization(username: String, password: String) -> String {
        "Basic " + Data("\(username):\(password)".utf8).base64EncodedString()
    }

    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        return encoder
    }()

    private static let decoder = JSONDecoder()
}

enum NetworkSession {
    static func make() -> URLSession {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 15
        configuration.timeoutIntervalForResource = 30
        configuration.waitsForConnectivity = false
        return URLSession(configuration: configuration)
    }
}
