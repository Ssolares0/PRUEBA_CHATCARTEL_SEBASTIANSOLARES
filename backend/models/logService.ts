import {Log} from './logModel';

interface LogEntry {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    resource: 'USER' | 'PROJECT' | 'TASK';
}

export const CrearLog = async (logEntry: LogEntry) => {
    const log = new Log(logEntry);
    try {
        await Log.create({ ...logEntry,timesamp: new Date() });
    } catch (error) {
        console.log('Error al crear el log', error);
        throw new Error('Error al crear el log');
    
    }
}