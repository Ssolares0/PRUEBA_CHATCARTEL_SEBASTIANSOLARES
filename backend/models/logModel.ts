import {Schema,model,Document} from 'mongoose'; 


interface ILog extends Document {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    resource: 'USER' | 'PROJECT' | 'TASK';
    timestamp: Date;
}

const logSchema = new Schema<ILog>({
    userId: {type: String, required: true},
    action: {type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true},
    resource: {type: String, enum: ['USER', 'PROJECT', 'TASK'], required: true},
    timestamp: {type: Date, default: Date.now}
})

export const Log = model<ILog>('Log', logSchema);