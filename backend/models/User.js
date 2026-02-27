const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        role: {
            type: String,
            enum: ['Customer', 'Super Admin', 'Brand Admin', 'Area Manager', 'Store Manager', 'Store User', 'Factory Manager'],
            default: 'Customer',
        },
        assignedBrand: {
            type: String,
            default: null,
        },
        assignedFactory: {
            type: String,
            default: null,
        },
        assignedOutlets: [{
            type: String,
        }],
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        verificationToken: String,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        addresses: [
            {
                label: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
                addressLine: { type: String, required: true },
                city: { type: String, required: true },
                zipCode: { type: String, required: true },
                coordinates: {
                    lat: { type: Number, required: false },
                    lng: { type: Number, required: false },
                },
                isDefault: { type: Boolean, default: false },
            },
        ],
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cake',
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Mongoose v7+ async pre-save hooks do NOT receive `next` — just return a promise
userSchema.pre('save', async function () {
    const adminRoles = ['Super Admin', 'Brand Admin', 'Area Manager', 'Store Manager', 'Factory Manager'];
    if (adminRoles.includes(this.role)) {
        this.isAdmin = true;
    }

    if (!this.isModified('password')) {
        return; // no next() needed in async hooks
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
