import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    let accounts: AccountStore
    let mail: MailStore
    let ota: OTAConfigurationStore
    let administration: AdministrationStore
    var isPresentingAccountSetup = false
    var refreshGeneration = 0

    init(
        accounts: AccountStore? = nil,
        mail: MailStore? = nil,
        ota: OTAConfigurationStore? = nil,
        administration: AdministrationStore? = nil
    ) {
        self.accounts = accounts ?? AccountStore()
        self.mail = mail ?? MailStore()
        self.ota = ota ?? OTAConfigurationStore()
        self.administration = administration ?? AdministrationStore()
    }

    func select(_ account: MailAccount) {
        accounts.select(account)
        mail.clear()
        ota.loadCached(for: account)
        Task { await ota.refresh(for: account) }
        Task { await refreshAdministration(for: account) }
    }

    func requestMailRefresh() {
        refreshGeneration &+= 1
    }

    func password(for account: MailAccount) throws -> String {
        try accounts.password(for: account)
    }

    func refreshAdministration(for account: MailAccount? = nil) async {
        guard let account = account ?? accounts.selectedAccount else { return }
        do {
            let password = try password(for: account)
            await administration.activate(account: account, password: password)
        } catch {
            administration.errorMessage = error.localizedDescription
        }
    }
}
