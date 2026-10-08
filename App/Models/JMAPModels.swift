import Foundation

enum JMAPCapability {
    static let core = "urn:ietf:params:jmap:core"
    static let mail = "urn:ietf:params:jmap:mail"
    static let submission = "urn:ietf:params:jmap:submission"
}

struct JMAPSession: Decodable, Sendable {
    struct Account: Decodable, Sendable {
        let name: String
        let isPersonal: Bool
        let isReadOnly: Bool
        let accountCapabilities: [String: JSONValue]
    }

    let capabilities: [String: JSONValue]
    let accounts: [String: Account]
    let primaryAccounts: [String: String]
    let username: String
    let apiUrl: URL
    let downloadUrl: String?
    let uploadUrl: URL?
    let eventSourceUrl: String?
}

struct Mailbox: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let name: String
    let parentId: String?
    let role: String?
    let sortOrder: Int
    let totalEmails: Int
    let unreadEmails: Int
}

struct JMAPGetResponse<Item: Decodable & Sendable>: Decodable, Sendable {
    let accountId: String
    let state: String
    let list: [Item]
    let notFound: [String]
}

struct EmailQueryResponse: Decodable, Sendable {
    let accountId: String
    let queryState: String
    let canCalculateChanges: Bool
    let position: Int
    let ids: [String]
    let total: Int?
    let limit: Int?
}

struct MailAddress: Codable, Hashable, Sendable {
    let name: String?
    let email: String

    var label: String {
        let cleaned = name?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return cleaned.isEmpty ? email : cleaned
    }
}

struct EmailBodyPart: Decodable, Hashable, Sendable {
    let partId: String?
    let blobId: String?
    let size: Int
    let type: String
    let name: String?
}

struct EmailBodyValue: Decodable, Hashable, Sendable {
    let value: String
    let isEncodingProblem: Bool
    let isTruncated: Bool
}

struct MailMessage: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let blobId: String
    let threadId: String
    let mailboxIds: [String: Bool]
    let keywords: [String: Bool]
    let size: Int
    let receivedAt: Date
    let sentAt: Date?
    let from: [MailAddress]?
    let to: [MailAddress]?
    let subject: String
    let preview: String
    let hasAttachment: Bool
    let textBody: [EmailBodyPart]?
    let bodyValues: [String: EmailBodyValue]?

    var senderLabel: String { from?.first?.label ?? "未知发件人" }
    var senderAddress: String { from?.first?.email ?? "" }
    var isUnread: Bool { keywords["$seen"] != true }
    var isStarred: Bool { keywords["$flagged"] == true }

    var plainTextBody: String {
        guard let parts = textBody, let values = bodyValues else { return preview }
        let body = parts.compactMap { part in
            part.partId.flatMap { values[$0]?.value }
        }.joined(separator: "\n\n")
        return body.isEmpty ? preview : body
    }
}

struct Identity: Decodable, Identifiable, Sendable {
    let id: String
    let name: String
    let email: String
}

struct JMAPSetResponse: Decodable, Sendable {
    struct SetError: Decodable, Sendable {
        let type: String
        let description: String?
    }

    let accountId: String
    let oldState: String?
    let newState: String?
    let created: [String: JSONValue]?
    let updated: [String: JSONValue]?
    let destroyed: [String]?
    let notCreated: [String: SetError]?
    let notUpdated: [String: SetError]?
}

struct ComposeDraft: Sendable {
    var to = ""
    var subject = ""
    var body = ""
}

enum MailScope: String, CaseIterable, Identifiable, Sendable {
    case inbox
    case starred
    case sent

    var id: String { rawValue }

    var title: String {
        switch self {
        case .inbox: "收件箱"
        case .starred: "已加星"
        case .sent: "已发送"
        }
    }

    var systemImage: String {
        switch self {
        case .inbox: "tray.full"
        case .starred: "star"
        case .sent: "paperplane"
        }
    }
}
