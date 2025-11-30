import React from "react";
import type { BookingResponse } from "../types/booking";

interface ConfirmationViewProps {
  booking: BookingResponse;
}

/**
 * ConfirmationView
 * Visar nyckelinfo från bokningen i en ren layout.
 */
const ConfirmationView: React.FC<ConfirmationViewProps> = ({ booking }) => {
  return (
    <main className="card app">
      <div className="header" style={{ marginBottom: 8 }}>
        <div className="logo">S</div>
        <div>
          <div className="title">Bokningen är bekräftad</div>
          <div className="small">Tack — vi ses på banan! 🎳</div>
        </div>
      </div>

      <div className="form-group confirm-grid">
        <div>
          <div className="keyline">Bokningsnummer</div>
          <div className="value">{booking.id}</div>
        </div>

        <div>
          <div className="keyline">Totalt</div>
          <div className="value">{booking.price} kr</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="small keyline">När</div>
        <div className="value">{booking.when}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="small keyline">Banor & spelare</div>
        <div className="value">
          {booking.lanes} bana{booking.lanes > 1 ? "or" : ""} • {booking.people}{" "}
          spelare
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="small keyline">Skor</div>
        <div className="small">{booking.shoes.join(", ")}</div>
      </div>
    </main>
  );
};

export default ConfirmationView;
