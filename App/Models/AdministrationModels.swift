import Foundation

struct AdministrationAccess: Codable, Equatable, Sendable {
    let permissions: Set<String>
    let edition: String?
    let locale: String?

    var isAdministrator: Bool {
        canReadAccounts
    }

    var canReadAccounts: Bool {
        hasPermission("sysAccountGet") && hasPermission("sysAccountQuery")
    }

    var canCreateAccounts: Bool { hasPermission("sysAccountCreate") }
    var canUpdateAccounts: Bool { hasPermission("sysAccountUpdate") }
    var canDeleteAccounts: Bool { hasPermission("sysAccountDestroy") }

    var supportsTemporaryMail: Bool {
        hasPermission("sysMaskedEmailGet") && hasPermission("sysMaskedEmailQuery")
    }

    var canCreateTemporaryMail: Bool { hasPermission("sysMaskedEmailCreate") }
    var canUpdateTemporaryMail: Bool { hasPermission("sysMaskedEmailUpdate") }
    var canDeleteTemporaryMail: Bool { hasPermission("sysMaskedEmailDestroy") }

    func hasPermission(_ permission: String) -> Bool {
        let expected = Self.normalized(permission)
        return permissions.contains { Self.normalized($0) == expected }
    }

    private static func normalized(_ value: String) -> String {
        value.lowercased().filter(\.isLetter)
    }
}

struct ManagedDomain: Identifiable, Hashable, Sendable {
    let id: String
    let name: String

    init?(json: JSONValue) {
        guard let object = json.objectValue,
              let id = object["id"]?.stringValue,
              let name = object["name"]?.stringValue else { return nil }
        self.id = id
        self.name = name
    }
}

struct ManagedAccount: Identifiable, Equatable, Sendable {
    let id: String
    let type: String
    let name: String
    let domainID: String
    let emailAddress: String
    let description: String?
    let createdAt: Date?
    let usedDiskQuota: Int
    let permissions: JSONValue

    var isUser: Bool { type == "User" }

    var isSuspended: Bool {
        guard let permissionObject = permissions.objectValue,
              let disabled = permissionObject["disabledPermissions"] else { return false }
        return disabled.containsSetValue("authenticate")
    }

    var displayName: String {
        let cleaned = description?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return cleaned.isEmpty ? emailAddress : cleaned
    }

    init?(json: JSONValue) {
        guard let object = json.objectValue,
              let id = object["id"]?.stringValue,
              let name = object["name"]?.stringValue else { return nil }
        self.id = id
        self.type = object["@type"]?.stringValue ?? "User"
        self.name = name
        self.domainID = object["domainId"]?.stringValue ?? ""
        self.emailAddress = object["emailAddress"]?.stringValue ?? name
        self.description = object["description"]?.stringValue
        self.createdAt = object["createdAt"]?.dateValue
        self.usedDiskQuota = object["usedDiskQuota"]?.integerValue ?? 0
        self.permissions = object["permissions"] ?? .object(["@type": .string("Inherit")])
    }

    func permissionsSetting(authenticationDisabled: Bool) -> JSONValue {
        var object = permissions.objectValue ?? ["@type": .string("Inherit")]
        let currentType = object["@type"]?.stringValue ?? "Inherit"

        if authenticationDisabled {
            if currentType == "Inherit" {
                object["@type"] = .string("Merge")
                object["enabledPermissions"] = .object([:])
            }
            var disabled = object["disabledPermissions"]?.objectValue ?? [:]
            disabled["authenticate"] = .bool(true)
            object["disabledPermissions"] = .object(disabled)
        } else {
            var disabled = object["disabledPermissions"]?.objectValue ?? [:]
            disabled.removeValue(forKey: "authenticate")
            object["disabledPermissions"] = .object(disabled)

            let enabled = object["enabledPermissions"]?.objectValue ?? [:]
            if currentType == "Merge", enabled.isEmpty, disabled.isEmpty {
                object = ["@type": .string("Inherit")]
            }
        }
        return .object(object)
    }
}

struct TemporaryAddress: Identifiable, Equatable, Sendable {
    let id: String
    let accountID: String?
    let email: String
    let description: String?
    let forDomain: String?
    let createdAt: Date?
    let expiresAt: Date?
    let isEnabled: Bool

    init?(json: JSONValue) {
        guard let object = json.objectValue,
              let id = object["id"]?.stringValue,
              let email = object["email"]?.stringValue else { return nil }
        self.id = id
        self.accountID = object["accountId"]?.stringValue
        self.email = email
        self.description = object["description"]?.stringValue
        self.forDomain = object["forDomain"]?.stringValue
        self.createdAt = object["createdAt"]?.dateValue
        self.expiresAt = object["expiresAt"]?.dateValue
        self.isEnabled = object["enabled"]?.boolValue ?? true
    }
}

struct ManagedAccountDraft: Equatable, Sendable {
    var localPart = ""
    var domainID = ""
    var displayName = ""
    var password = ""
}

struct TemporaryAddressDraft: Equatable, Sendable {
    var prefix = ""
    var domain = ""
    var description = ""
    var forDomain = ""
}

extension JSONValue {
    fileprivate func containsSetValue(_ value: String) -> Bool {
        if let objectValue { return objectValue[value]?.boolValue != false && objectValue[value] != nil }
        if let arrayValue { return arrayValue.contains { $0.stringValue == value } }
        return false
    }
}
