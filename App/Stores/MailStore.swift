import Foundation
import Observation

@MainActor
@Observable
final class MailStore {
    private(set) var messagesByScope: [MailScope: [MailMessage]] = [:]
    private(set) var isLoading = false
    private(set) var isSending = false
    private(set) var lastUpdated: Date?
    var errorMessage: String?

    func clear() {
        messagesByScope = [:]
        errorMessage = nil
        lastUpdated = nil
    }

    func messages(for scope: MailScope) -> [MailMessage] {
        messagesByScope[scope] ?? []
    }

    func load(
        account: MailAccount,
        password: String,
        scope: MailScope,
        searchText: String,
        limit: Int
    ) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let client = JMAPClient(account: account, password: password)
            messagesByScope[scope] = try await client.fetchMessages(
                scope: scope,
                searchText: searchText,
                limit: limit
            )
            lastUpdated = .now
        } catch is CancellationError {
            return
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func send(_ draft: ComposeDraft, account: MailAccount, password: String) async throws {
        isSending = true
        defer { isSending = false }
        let client = JMAPClient(account: account, password: password)
        try await client.send(draft)
    }

    func markRead(_ message: MailMessage, account: MailAccount, password: String) async {
        guard message.isUnread else { return }
        do {
            let client = JMAPClient(account: account, password: password)
            try await client.markRead(messageID: message.id)
        } catch {
            // 阅读状态同步失败不阻断正文阅读；下次刷新会重试显示服务器状态。
        }
    }
}
