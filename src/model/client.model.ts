import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import config from "config";

export interface ClientDocument extends mongoose.Document {
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const ClientSchema = new mongoose.Schema(
    {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
        agencyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Agency" },
        fullName: { type: String, required: true },
        email: { type: String, trim: true, index: true, lowercase: true, default: '', required: true },
        countryCode: { type: String, trim: true, index: true, default: '', required: true },
        mobileNo: { type: String, trim: true, index: true, default: '', required: true },
        isMobileVerified: { type: Boolean, default: false },
        isEmailVerified: { type: Boolean, default: false },
        OTP: { type: String, index: true, sparse: true },
        isProfileCompleted: { type: Boolean, default: false, index: true },
        profilePicture: { type: String, default: "" },
        password: { type: String, required: true },
        status: { type: String, enum: ["BLOCKED", "UN_BLOCKED", "DELETED"], default: "UN_BLOCKED", index: true },
        totalBill: { type: String, required: true },
    },
    {
        versionKey: false,
        timestamps: true
    }
);


ClientSchema.pre("save", async function (next: mongoose.HookNextFunction) {
    let user = this as ClientDocument;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();
    // Random additional data
    const salt = await bcrypt.genSalt(config.get("saltWorkFactor"));
    const hash = await bcrypt.hashSync(user.password, salt);
    // Replace the password with the hash
    user.password = hash;

    return next();
});

// Used for logging in
ClientSchema.methods.comparePassword = async function (candidatePassword: string) {
    const user = this as ClientDocument;

    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const Client = mongoose.model<ClientDocument>("Client", ClientSchema);

export default Client;
