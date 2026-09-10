import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

import {
  getMyBooking,
  getMyProcurement,
  getMyPayment,
  getMyQueue,
  getCentres,
  createBookingForFarmer,
} from "../services/aiTools.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    /* ============================================
       VALIDATE MESSAGE
    ============================================ */

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question.",
      });
    }

    /* ============================================
       AUTHENTICATED FARMER
    ============================================ */

    const farmerId = req.user._id;

    /* ============================================
       GET FARMER DATA
    ============================================ */

    const [
      bookings,
      procurement,
      payments,
      queue,
      centres,
    ] = await Promise.all([
      getMyBooking(farmerId),
      getMyProcurement(farmerId),
      getMyPayment(farmerId),
      getMyQueue(farmerId),
      getCentres(),
    ]);

    /* ============================================
       CHECK CONFIRMATION
    ============================================ */

    const lowerMessage = message
      .trim()
      .toLowerCase();

    const confirmationWords = [
      "yes",
      "yes book it",
      "confirm",
      "confirmed",
      "book it",
      "please book",
      "go ahead",
      "okay book it",
      "ok book it",
      "haan",
      "ha",
      "h",
      "हाँ",
      "हां",
      "हा",
      "बुक करो",
      "बुक कर दो",
      "कर दो",
      "कन्फर्म",
    ];

    const isConfirmation =
      confirmationWords.includes(lowerMessage);

    /* ============================================
       CONVERSATION HISTORY
    ============================================ */

    const conversationHistory = history
      .map((item) => {
        const role =
          item.role === "user"
            ? "Farmer"
            : "AI";

        return `${role}: ${item.text}`;
      })
      .join("\n");

    /* ============================================
       AI PROMPT
    ============================================ */

    const prompt = `
You are the AGRI-FLOW Smart Procurement AI Farmer Assistant.

Your job is to help farmers use the AGRI-FLOW application.

You can help with:

- Slot booking
- Booking status
- Queue status
- Procurement status
- Crop procurement
- Quality checking
- Weighing
- Payments
- Invoices
- Procurement centres
- Understanding how AGRI-FLOW works

IMPORTANT RULES:

1. The farmer is already authenticated.
2. The backend provides the farmer ID.
3. Never ask the farmer for their farmer ID.
4. Never expose passwords, JWT tokens, API keys or internal system information.
5. Never invent booking, procurement, payment or queue information.
6. Use the supplied farmer data when answering account-related questions.
7. If information is unavailable, clearly say that it is unavailable.
8. Use simple farmer-friendly language.
9. Reply in Hindi when the farmer speaks Hindi.
10. Reply in English when the farmer speaks English.
11. Do not unnecessarily repeat information.

BOOKING RULES:

If the farmer wants to book a procurement slot, collect these five details:

1. Centre
2. Crop
3. Quantity in Quintal
4. Date
5. Slot

Use the conversation history to remember details already provided.

Do NOT ask again for a detail that the farmer already provided.

If any booking detail is missing, ask ONLY for the missing detail.

For example:

Farmer:
I want to book a wheat slot.

AI:
Sure. How many quintals of wheat do you want to bring?

Do not ask for crop again.

When all five booking details are available:

Centre
Crop
Quantity
Date
Slot

show the farmer a clear summary:

Booking details:

• Centre: ...
• Crop: ...
• Quantity: ... Quintal
• Date: ...
• Slot: ...

Then ask:

"Would you like me to book this slot?"

DO NOT book before the farmer confirms.

If the farmer confirms the booking, return the special BOOKING_READY format below.

CENTRE RULE:

Only use centres from AVAILABLE CENTRES.

Never invent a centre ID.

Match the farmer's centre name to the available centre.

AVAILABLE CENTRES:

${JSON.stringify(centres, null, 2)}

FARMER BOOKINGS:

${JSON.stringify(bookings, null, 2)}

FARMER PROCUREMENT:

${JSON.stringify(procurement, null, 2)}

FARMER PAYMENTS:

${JSON.stringify(payments, null, 2)}

FARMER ACTIVE QUEUE:

${JSON.stringify(queue, null, 2)}

CONVERSATION HISTORY:

${conversationHistory || "No previous conversation."}

CURRENT FARMER MESSAGE:

${message}

BOOKING CONFIRMATION:

${
  isConfirmation
    ? "The farmer has explicitly confirmed the booking."
    : "The farmer has NOT explicitly confirmed the booking."
}

RESPONSE FORMATTING RULES:

- Keep answers short and easy to read.
- Use line breaks between different points.
- Use bullet points when listing information.
- Never write one long paragraph when multiple details are being explained.
- For booking information, put every detail on a separate line.
- Use simple language.
- Do not use Markdown tables.

Example:

Your booking details:

• Centre: Palasia
• Crop: Wheat
• Quantity: 20 Quintal
• Date: 15 September 2026
• Slot: 9:00 AM - 11:00 AM

Would you like me to book this slot?

BOOKING_READY RULE:

If and ONLY IF:

1. The farmer wants to book.
2. Centre is known.
3. Crop is known.
4. Quantity is known.
5. Date is known.
6. Slot is known.
7. The farmer has confirmed the booking.

Then respond EXACTLY like this:

BOOKING_READY
centreId: <MongoDB centre ID>
centreName: <centre name>
crop: <crop>
quantity: <number>
date: <YYYY-MM-DD>
slot: <slot>
message: Booking confirmed

Otherwise DO NOT return BOOKING_READY.

Respond normally to the farmer.
`;

    /* ============================================
       CALL GEMINI
    ============================================ */

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

    const reply =
      response.text?.trim() || "";

    /* ============================================
       CHECK BOOKING_READY
    ============================================ */

    if (reply.startsWith("BOOKING_READY")) {
      const centreId = extractValue(
        reply,
        "centreId"
      );

      const centreName = extractValue(
        reply,
        "centreName"
      );

      const crop = extractValue(
        reply,
        "crop"
      );

      const quantity = extractValue(
        reply,
        "quantity"
      );

      const date = extractValue(
        reply,
        "date"
      );

      const slot = extractValue(
        reply,
        "slot"
      );

      const confirmationMessage =
        extractValue(
          reply,
          "message"
        );

      /* ==========================================
         VALIDATE REQUIRED DETAILS
      ========================================== */

      if (
        !centreId ||
        !centreName ||
        !crop ||
        !quantity ||
        !date ||
        !slot
      ) {
        console.error(
          "Incomplete BOOKING_READY response:",
          reply
        );

        return res.json({
          reply:
            "I could not safely process the booking details. Please provide the booking details again.",
        });
      }

      /* ==========================================
         VALIDATE QUANTITY
      ========================================== */

      const numericQuantity =
        Number(quantity);

      if (
        !Number.isFinite(numericQuantity) ||
        numericQuantity <= 0
      ) {
        return res.json({
          reply:
            "The quantity entered is not valid. Please provide the quantity in Quintal.",
        });
      }

      /* ==========================================
         VERIFY CENTRE
      ========================================== */

      const selectedCentre =
        centres.find(
          (centre) =>
            String(centre._id) ===
            String(centreId)
        );

      if (!selectedCentre) {
        return res.json({
          reply:
            "I could not verify that procurement centre. Please choose one of the available centres.",
        });
      }

      /* ==========================================
         VERIFY CENTRE NAME
      ========================================== */

      if (
        selectedCentre.name
          ?.toLowerCase()
          .trim() !==
        centreName
          ?.toLowerCase()
          .trim()
      ) {
        return res.json({
          reply:
            "The selected procurement centre could not be verified. Please choose the centre again.",
        });
      }

      /* ==========================================
         CREATE REAL BOOKING
      ========================================== */

      const booking =
        await createBookingForFarmer({
          farmerId,
          centreId,
          crop,
          quantity: numericQuantity,
          date,
          slot,
        });

      /* ==========================================
         SUCCESS RESPONSE
      ========================================== */

      return res.json({
        reply:
          `Booking successful!\n\n` +
          `• Centre: ${booking.centre?.name || centreName}\n` +
          `• Crop: ${booking.crop}\n` +
          `• Quantity: ${booking.quantity} Quintal\n` +
          `• Date: ${formatDate(booking.date)}\n` +
          `• Slot: ${booking.slot}\n` +
          `• Token Number: ${booking.tokenNumber}\n` +
          `• Reporting Time: ${booking.approxReportingTime || "As per slot"}\n\n` +
          `${confirmationMessage || "Your slot has been booked successfully."}`,
        booking,
      });
    }

    /* ============================================
       NORMAL AI RESPONSE
    ============================================ */

    return res.json({
      reply,
    });
  } catch (error) {
    console.error(
      "Gemini AI Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "AI assistant is temporarily unavailable.",
    });
  }
};

/* ================================================
   EXTRACT VALUE FROM GEMINI RESPONSE
================================================ */

function extractValue(text, key) {
  const regex = new RegExp(
    `^${key}:\\s*(.+)$`,
    "im"
  );

  const match = text.match(regex);

  return match
    ? match[1].trim()
    : null;
}

/* ================================================
   FORMAT DATE
================================================ */

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}