import XCTest
@testable import TEMPOMail

final class JSONValueTests: XCTestCase {
    func testRoundTripPreservesJMAPPayload() throws {
        let value: JSONValue = .object([
            "using": .array([.string(JMAPCapability.core), .string(JMAPCapability.mail)]),
            "limit": .integer(50),
            "filter": .object(["hasKeyword": .string("$flagged")])
        ])
        let data = try JSONEncoder().encode(value)
        XCTAssertEqual(try JSONDecoder().decode(JSONValue.self, from: data), value)
    }
}
