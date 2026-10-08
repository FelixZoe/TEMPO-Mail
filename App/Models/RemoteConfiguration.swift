import Foundation

struct RemoteConfiguration: Codable, Equatable, Sendable {
    static let fallback = RemoteConfiguration(
        schemaVersion: 1,
        expiresAt: nil,
        announcement: nil,
        supportURL: nil,
        inboxPageSize: 50,
        refreshIntervalSeconds: 300,
        features: [:]
    )

    let schemaVersion: Int
    let expiresAt: Date?
    let announcement: String?
    let supportURL: URL?
    let inboxPageSize: Int
    let refreshIntervalSeconds: Int
    let features: [String: Bool]

    var isExpired: Bool {
        guard let expiresAt else { return false }
        return expiresAt < .now
    }

    var normalizedPageSize: Int { min(max(inboxPageSize, 10), 100) }
    var normalizedRefreshInterval: Int { min(max(refreshIntervalSeconds, 60), 3_600) }
}

struct SignedConfigurationEnvelope: Decodable, Sendable {
    let payload: String
    let signature: String
}
