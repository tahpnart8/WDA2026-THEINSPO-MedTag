import { EmergencyProfile, SOSResponse } from '../types/emergency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchEmergencyProfile(shortId: string): Promise<EmergencyProfile> {
    const res = await fetch(`${API_URL}/emergency/${shortId}`, {
        cache: 'no-store'
    });
    if (!res.ok) throw new Error('Mã thiết bị không hợp lệ hoặc đã hết hạn.');
    return res.json();
}

export async function triggerSOS(shortId: string, lat?: number, lng?: number): Promise<SOSResponse> {
    const res = await fetch(`${API_URL}/emergency/${shortId}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
    if (!res.ok) throw new Error('Không thể phát tín hiệu SOS.');
    return res.json();
}

export async function cancelSOS(shortId: string, logId: string): Promise<void> {
    const res = await fetch(`${API_URL}/emergency/${shortId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
    });
    if (!res.ok) throw new Error('Không thể hủy tín hiệu Cấp cứu.');
}
