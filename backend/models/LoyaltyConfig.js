const mongoose = require('mongoose');

const loyaltyConfigSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    earnRate: { type: Number, default: 0.1 },
    redemptionValue: { type: Number, default: 0.01 },
    minRedemptionPoints: { type: Number, default: 100 },
    minOrderValueForEarn: { type: Number, default: 0 },
    expiryMonths: { type: Number, default: 12 },
    tiers: [
        {
            name: String,
            minPoints: Number,
            multiplier: Number,
            color: String
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('LoyaltyConfig', loyaltyConfigSchema);
