const { SingleEventRule } = require('./singleEventRule')

/**
 * A rule that requires the purchase of a specific listing.
 */
class ListingIdPurchaseRule extends SingleEventRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    if (!this.config.listingId) {
      throw new Error(`${this.str()}: missing listingId field`)
    }
    this.listingId = this.config.listingId
    if (!this.config.iconSrc) {
      throw new Error(`${this.str()}: missing iconSrc field`)
    }
    this.iconSrc = this.config.iconSrc
    this.titleKey = this.config.titleKey
    this.detailsKey = this.config.detailsKey
    this.title = this.config.title
    this.details = this.config.details

    if (!this.config.titleKey && !this.config.title) {
      throw new Error(
        `${this.str()}: either title or titleKey should be present`
      )
    }

    if (!this.config.detailsKey && !this.config.details) {
      throw new Error(
        `${this.str()}: either details or detailsKey should be present`
      )
    }
    this.addEventType('ListingPurchased')
  }

  /**
   * Filter function to use when calling _tallyEvent.
   * Filters out events that are not for an offer on the listingId of the rule.
   * For ListingPurchased events, customId is the offerId with
   * format <network>-<contract_version>-<listingSeq>-<offerSeq>
   * @param {string} customId
   * @returns {boolean}
   */
  customIdFilter(customId) {
    // Trim the offerId from customId to get the listingId.
    return (
      this.listingId ===
      customId
        .split('-')
        .slice(0, 3)
        .join('-')
    )
  }
}

module.exports = { ListingIdPurchaseRule }
