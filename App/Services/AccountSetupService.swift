import Foundation

struct AccountSetupService: Sendable {
    func connect(_ draft: ServerSetupDraft) async throws -> (account: MailAccount, password: String) {
        let email = draft.emailAddress.trimmingCharacters(in: .whitespacesAndNewlines)
        let enteredUsername = draft.username.trimmingCharacters(in: .whitespacesAndNewlines)
        let username = enteredUsername.isEmpty ? email : enteredUsername
        try ServerPolicy.validateEmail(email)
        let sessionURL = try ServerPolicy.sessionURL(from: draft.sessionEndpoint)
        let remoteConfigURL = try ServerPolicy.validatedURL(draft.remoteConfigEndpoint, required: false)
        let session = try await JMAPClient.discover(
            endpoint: sessionURL,
            username: username,
            password: draft.password
        )
        guard session.capabilities[JMAPCapability.mail] != nil else {
            throw JMAPError.missingCapability(JMAPCapability.mail)
        }
        guard session.capabilities[JMAPCapability.submission] != nil else {
            throw JMAPError.missingCapability(JMAPCapability.submission)
        }
        guard let accountID = session.primaryAccounts[JMAPCapability.mail],
              session.accounts[accountID] != nil else {
            throw JMAPError.missingCapability("主邮件账户")
        }

        let displayName = draft.displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        let publicKey = draft.remoteConfigPublicKey.trimmingCharacters(in: .whitespacesAndNewlines)
        let account = MailAccount(
            displayName: displayName.isEmpty ? email : displayName,
            emailAddress: email,
            username: username,
            sessionURL: sessionURL,
            apiURL: session.apiUrl,
            downloadURL: session.downloadUrl,
            uploadURL: session.uploadUrl,
            jmapAccountID: accountID,
            remoteConfigURL: remoteConfigURL,
            remoteConfigPublicKey: publicKey.isEmpty ? nil : publicKey
        )
        return (account, draft.password)
    }
}
