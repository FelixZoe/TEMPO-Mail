import SwiftUI

private enum MainTab: Hashable {
    case inbox
    case starred
    case sent
    case administration
    case settings
}

struct MailHomeView: View {
    @Environment(AppModel.self) private var model
    @State private var selection: MainTab = .inbox
    @State private var isComposing = false

    var body: some View {
        TabView(selection: $selection) {
            Tab("收件箱", systemImage: "tray.full", value: .inbox) {
                MailListView(scope: .inbox, isComposing: $isComposing)
            }
            Tab("星标", systemImage: "star", value: .starred) {
                MailListView(scope: .starred, isComposing: $isComposing)
            }
            Tab("已发送", systemImage: "paperplane", value: .sent) {
                MailListView(scope: .sent, isComposing: $isComposing)
            }
            if isAdministrator {
                Tab("管理", systemImage: "person.2.badge.gearshape", value: .administration) {
                    AdministrationView()
                }
            }
            Tab("设置", systemImage: "gearshape", value: .settings) {
                SettingsView()
            }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
        .sheet(isPresented: $isComposing) {
            ComposeView()
        }
        .task(id: model.accounts.selectedAccountID) {
            if let account = model.accounts.selectedAccount {
                model.ota.loadCached(for: account)
                await model.ota.refresh(for: account)
                await model.refreshAdministration(for: account)
            }
        }
        .onChange(of: isAdministrator) { _, isAdministrator in
            if !isAdministrator, selection == .administration { selection = .inbox }
        }
        .task(id: refreshTimerKey) {
            while !Task.isCancelled {
                let seconds = model.ota.configuration.normalizedRefreshInterval
                try? await Task.sleep(for: .seconds(seconds))
                guard !Task.isCancelled else { return }
                model.requestMailRefresh()
            }
        }
    }

    private var refreshTimerKey: String {
        "\(model.accounts.selectedAccountID?.uuidString ?? "none")|\(model.ota.configuration.normalizedRefreshInterval)"
    }

    private var isAdministrator: Bool {
        model.administration.isAdministrator(for: model.accounts.selectedAccount)
    }
}
