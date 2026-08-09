export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "nichemaster-2026" });
    }

    if (url.pathname === "/api/purchases" && request.method === "POST") {
      if (!env.NICHEMASTER_DB) {
        return Response.json({ error: "D1 is not configured" }, { status: 503 });
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      }

      const { book_id, user_email, amount_cents, currency = "USD", payment_id } = body;
      if (!book_id || !user_email || !Number.isInteger(amount_cents) || !payment_id) {
        return Response.json({ error: "book_id, user_email, amount_cents, and payment_id are required" }, { status: 400 });
      }

      try {
        await env.NICHEMASTER_DB.prepare(
          `INSERT INTO purchases (book_id, user_email, amount_cents, currency, payment_id)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(book_id, user_email, amount_cents, currency, payment_id).run();
      } catch (error) {
        return Response.json({ error: "Purchase could not be recorded" }, { status: 409 });
      }

      return Response.json({ ok: true, book_id, payment_id }, { status: 201 });
    }

    return new Response("NicheMaster API", { status: 404 });
  }
};
