import { useState } from "react";
import BookingView from "./components/BookingView.tsx";
import ConfirmationView from "./components/ConfirmationView.tsx";
import type { BookingResponse } from "./types/booking.ts";

function App() {
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  return (
    <div className="app">
      {!booking && <BookingView onBookingSuccess={setBooking} />}
      {booking && <ConfirmationView booking={booking} />}
    </div>
  );
}

export default App;
