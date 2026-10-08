import Foundation

struct MailAccount: Codable, Identifiable, Hashable, Sendable {
    let id: UUID
    var displayName: String
    var emailAddress: String
    var username: String
    var sessionURL: URL
    var apiURL: URL
    var downloadURL: String?
    var uploadURL: URL?
    var jmapAccountID: String
    var remoteConfigURL: URL?
    var remoteConfigPublicKey: String?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        displayName: String,
        emailAddress: String,
        username: String,
        sessionURL: URL,
        apiURL: URL,
        downloadURL: String?,
        uploadURL: URL?,
        jmapAccountID: String,
        remoteConfigURL: URL?,
        remoteConfigPublicKey: String?,
        createdAt: Date = .now
    ) {
        self.id = id
        self.displayName = displayName
        self.emailAddress = emailAddress
        self.username = username
        self.sessionURL = sessionURL
        self.apiURL = apiURL
        self.downloadURL = downloadURL
        self.uploadURL = uploadURL
        self.jmapAccountID = jmapAccountID
        self.remoteConfigURL = remoteConfigURL
        self.remoteConfigPublicKey = remoteConfigPublicKey
        self.createdAt = createdAt
    }
}

struct ServerSetupDraft: Equatable {
    var displayName = ""
    var emailAddress = ""
    var sessionEndpoint = ""
    var username = ""
    var password = ""
    var remoteConfigEndpoint = ""
    var remoteConfigPublicKey = ""
}
