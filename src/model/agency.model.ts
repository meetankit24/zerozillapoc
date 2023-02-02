import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import config from "config";

export interface AgencyDocument extends mongoose.Document {
    fullName: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    countryCode: string;
    mobileNo: string;
    isMobileVerified: boolean
    isEmailVerified: boolean;
    OTP: Number
    isProfileCompleted: boolean;
    profilePicture: string;
    address1: object
    address2: object
    status: string
    comparePassword(candidatePassword: string): Promise<boolean>;
}

let geoSchema = new mongoose.Schema({
    address: { type: String, trim: true, /* required: true,*/ },
    city: { type: String, trim: true },
    country: { type: String },
    street: { type: String },
    state: { type: String },
    postalCode: { type: String },
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere", default: [0, 0] }// [longitude, latitude]
}, {
    _id: false
});

const AgencySchema = new mongoose.Schema(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
        fullName: { type: String, required: true },
        email: { type: String, trim: true, index: true, lowercase: true, default: '' },
        countryCode: { type: String, trim: true, index: true, default: '' },
        mobileNo: { type: String, trim: true, index: true, default: '' },
        isMobileVerified: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
        OTP: { type: String, index: true, sparse: true },
        isProfileCompleted: { type: Boolean, default: false, index: true },
        profilePicture: { type: String, default: "" },
        address1: { type: geoSchema, default: {}, required: true },
        address2: { type: geoSchema, default: {} },
        password: { type: String, required: true },
        status: { type: String, enum: ["BLOCKED", "UN_BLOCKED", "DELETED"], default: "UN_BLOCKED", index: true }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

AgencySchema.pre("save", async function (next: mongoose.HookNextFunction) {
    let user = this as AgencyDocument;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();
    // Random additional data
    const salt = await bcrypt.genSalt(config.get("saltWorkFactor"));

    const hash = bcrypt.hashSync(user.password, salt);

    // Replace the password with the hash
    user.password = hash;

    return next();
});

// Used for logging in
AgencySchema.methods.comparePassword = async function (candidatePassword: string) {
    const user = this as AgencyDocument;
    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

AgencySchema.index({ email: 1, status: 1 });
AgencySchema.index({ countryCode: 1, mobileNo: 1 });
AgencySchema.index({ createdAt: -1 });
AgencySchema.index({ fullName: 1 });
AgencySchema.index({ fullName: 1, status: 1 });

const Agency = mongoose.model<AgencyDocument>("Agency", AgencySchema);

export default Agency;
