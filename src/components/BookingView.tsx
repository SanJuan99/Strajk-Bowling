import React, { useState, type ChangeEvent, type FormEvent } from "react";
import type { BookingResponse, BookingRequest } from "../types/booking";

interface BookingViewProps {
  onBookingSuccess: (booking: BookingResponse) => void;
}

/**
 * BookingView
 * - Form för att skapa en bokning
 * - Inkluderar client-side validering (antal skor = spelare, max 4 per bana etc)
 * - Hämtar API-nyckel och skickar POST mot backend
 */
const BookingView: React.FC<BookingViewProps> = ({ onBookingSuccess }) => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [lanes, setLanes] = useState<number>(1);
  const [people, setPeople] = useState<number>(1);
  const [shoeSizes, setShoeSizes] = useState<string[]>([""]);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [shoeError, setShoeError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // När antalet spelare ändras, anpassa shoeSizes-arrayens längd
  const handlePeopleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value < 1) return;
    setPeople(value);
    setShoeSizes((prev) => {
      const copy = [...prev];
      if (value > copy.length) {
        return [...copy, ...Array(value - copy.length).fill("")];
      } else {
        return copy.slice(0, value);
      }
    });
  };

  const handleShoeSizeChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setShoeSizes((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  /**
   * handleSubmit
   * - körs när användaren klickar "Strike!"
   * - gör validering innan nätverksanrop
   * - anropar /key och /booking
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setShoeError(null);

    if (!date || !time) {
      setError("Välj datum och tid.");
      return;
    }

    const when = `${date}T${time}`;

    // --- Skovalidering ---
    if (shoeSizes.length !== people) {
      setShoeError(`Antalet skostorlekar måste vara exakt ${people}.`);
      return;
    }

    const anyEmptyShoe = shoeSizes.some((s) => s.trim() === "");
    if (anyEmptyShoe) {
      setShoeError(
        `Fyll i alla skostorlekar — det måste finnas exakt ${people} värden.`
      );
      return;
    }

    const shoesNums: number[] = shoeSizes.map((s) => Number(s));
    const anyInvalidNumber = shoesNums.some((n) => Number.isNaN(n));
    if (anyInvalidNumber) {
      setShoeError("En eller flera skostorlekar är inte ett giltigt nummer.");
      return;
    }

    const minShoe = 20;
    const maxShoe = 60;
    const anyOutOfRange = shoesNums.some((n) => n < minShoe || n > maxShoe);
    if (anyOutOfRange) {
      setShoeError(`Skostorlekar måste vara mellan ${minShoe} och ${maxShoe}.`);
      return;
    }

    // --- Spelare per bana validering ---
    const maxPeople = lanes * 4;
    if (people > maxPeople) {
      setError(
        `Max 4 spelare per bana. Du har ${people} spelare men bara ${lanes} bana${
          lanes > 1 ? "or" : ""
        }.`
      );
      return;
    }

    const bookingRequest: BookingRequest = {
      when,
      lanes,
      people,
      shoes: shoesNums,
    };

    setLoading(true);

    try {
      // Hämta API-nyckel
      const keyResponse = await fetch(
        "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/key"
      );

      if (!keyResponse.ok) {
        throw new Error("Kunde inte hämta API-nyckel. Försök igen senare.");
      }

      let apiKey = "";

      try {
        const data = (await keyResponse.json()) as unknown;
        if (typeof data === "string") {
          apiKey = data.trim();
        } else if (data && typeof data === "object") {
          const obj = data as { key?: string; apiKey?: string };
          apiKey = (obj.key ?? obj.apiKey ?? "").trim();
        }
      } catch {
        const text = await keyResponse.text();
        apiKey = text.trim();
      }

      if (!apiKey) {
        throw new Error("Ogiltig API-nyckel från servern.");
      }

      // Skicka booking-request
      const bookingResponse = await fetch(
        "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(bookingRequest),
        }
      );

      if (!bookingResponse.ok) {
        let message =
          "Det gick inte att genomföra bokningen. Servern är instabil, försök igen.";
        try {
          const errData = await bookingResponse.json();
          if (errData && typeof errData.message === "string") {
            message = errData.message;
          }
        } catch {
          // behåll default
        }
        throw new Error(message);
      }

      // Tolka svar (mappa formatet till vår BookingResponse-typ)
      const raw = (await bookingResponse.json()) as any;

      let bookingData: BookingResponse;

      if (raw && typeof raw === "object") {
        if (raw.bookingDetails) {
          const d = raw.bookingDetails;
          bookingData = {
            when: d.when,
            lanes: d.lanes,
            people: d.people,
            shoes: d.shoes,
            price: d.price,
            id: d.bookingId ?? d.id ?? "",
            active: d.active,
          };
        } else if ("body" in raw && typeof raw.body === "string") {
          const body = JSON.parse(raw.body) as any;
          bookingData = {
            when: body.when,
            lanes: body.lanes,
            people: body.people,
            shoes: body.shoes,
            price: body.price,
            id: body.bookingId ?? body.id ?? "",
            active: body.active,
          };
        } else {
          bookingData = raw as BookingResponse;
        }
      } else {
        throw new Error("Ogiltigt svar från servern.");
      }

      // Lyckad bokning → navigera till ConfirmationView via parent callback
      onBookingSuccess(bookingData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Något gick fel. Försök igen om en liten stund."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- JSX (presentationsdelen) ----------
  return (
    <main className="card app" aria-live="polite">
      <div className="header">
        <div className="logo">S</div>
        <div>
          <div className="title">Strajk Bowling</div>
          <div className="small">Boka bana & skor 🎳</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Tid</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Antal banor</label>
          <input
            type="number"
            min={1}
            value={lanes}
            onChange={(e) => setLanes(Number(e.target.value))}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Antal spelare</label>
          <input
            type="number"
            min={1}
            value={people}
            onChange={handlePeopleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Skostorlekar</label>
          <div className="shoe-grid">
            {shoeSizes.map((size, index) => (
              <input
                key={index}
                type="number"
                required
                min={20}
                max={60}
                value={size}
                onChange={(e) => handleShoeSizeChange(index, e)}
                disabled={loading}
              />
            ))}
          </div>
          {shoeError && <div className="error">{shoeError}</div>}
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Bokar..." : "Strike! 🎯"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default BookingView;
