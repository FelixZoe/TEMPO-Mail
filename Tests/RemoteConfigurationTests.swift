import XCTest
@testable import TEMPOMail

final class RemoteConfigurationTests: XCTestCase {
    func testPageSizeIsRestrictedToSafeRange() {
        let tooSmall = RemoteConfiguration(
            schemaVersion: 1,
            expiresAt: nil,
            announcement: nil,
            supportURL: nil,
            inboxPageSize: 1,
            refreshIntervalSeconds: 60,
            features: [:]
        )
        let tooLarge = RemoteConfiguration(
            schemaVersion: 1,
            expiresAt: nil,
            announcement: nil,
            supportURL: nil,
            inboxPageSize: 1_000,
            refreshIntervalSeconds: 60,
            features: [:]
        )
        XCTAssertEqual(tooSmall.normalizedPageSize, 10)
        XCTAssertEqual(tooLarge.normalizedPageSize, 100)
        XCTAssertEqual(tooSmall.normalizedRefreshInterval, 60)
    }

    func testExpiredConfigurationIsRejectedByState() {
        let configuration = RemoteConfiguration(
            schemaVersion: 1,
            expiresAt: Date(timeIntervalSince1970: 0),
            announcement: nil,
            supportURL: nil,
            inboxPageSize: 50,
            refreshIntervalSeconds: 300,
            features: [:]
        )
        XCTAssertTrue(configuration.isExpired)
    }
}
