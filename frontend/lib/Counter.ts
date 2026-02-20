import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
    name: string;
    count: number;
    lastClickedAt: Date;
}

const CounterSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, default: 'global' },
    count: { type: Number, required: true, default: 0 },
    lastClickedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
