import axios from 'axios';

const eonet = axios.create({
  baseURL: 'https://eonet.gsfc.nasa.gov/api/v3',
  timeout: 10000,
});

export type EventCategory =
  | 'severeStorms'
  | 'floods'
  | 'wildfires'
  | 'earthquakes'
  | 'volcanoes'
  | 'landslides'
  | 'drought'
  | 'snow'
  | 'dustHaze'
  | 'tempExtremes'
  | string;

export interface NasaEventGeometry {
  date: string;
  type: string;
  coordinates: number[];
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
}

export interface NasaEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  closed: string | null;
  categories: { id: EventCategory; title: string }[];
  geometry: NasaEventGeometry[];
}

interface EonetResponse {
  events: NasaEvent[];
}

export async function getActiveDisasters(limit = 30): Promise<NasaEvent[]> {
  const { data } = await eonet.get<EonetResponse>('/events', {
    params: { status: 'open', limit },
  });
  return data.events ?? [];
}
