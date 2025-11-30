export interface BookingRequest {
  when: string; // t.ex. "2025-11-11T18:00"
  lanes: number; // antal banor
  people: number; // antal spelare
  shoes: number[]; // skostorlekar
}

export interface BookingResponse extends BookingRequest {
  price: number; // från servern
  id: string; // genereras på servern
  active: boolean; // från servern
}
