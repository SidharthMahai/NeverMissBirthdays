export const AboutPage = () => {
  return (
    <section className="about-shell">
      <article className="about-hero">
        <span className="badge">About NeverMissBirthdays</span>
        <h1>The calm, classy way to stop forgetting birthdays.</h1>
        <p>
          NeverMissBirthdays exists for people who are smart, capable, and still somehow blindsided by a
          birthday notification 14 minutes too late. We turned that panic into a polished workflow.
        </p>
      </article>

      <section className="about-grid">
        <article className="about-card">
          <h3>Why this product</h3>
          <p>
            Most birthday tools are either too basic or too noisy. We wanted something elegant: quick input,
            useful filtering, and reminder-ready structure that scales from personal life to team operations.
          </p>
        </article>

        <article className="about-card">
          <h3>How it works</h3>
          <p>
            You enter a private access ID, store birthdays once, and organize by relation and month. Records are
            designed for a shared Google Sheet backend so reminder automation can run reliably.
          </p>
        </article>

        <article className="about-card">
          <h3>Design philosophy</h3>
          <p>
            Friendly but premium. Playful, never chaotic. Smooth animations, clear hierarchy, and empty states
            that still feel like a product, not a dead end.
          </p>
        </article>

        <article className="about-card">
          <h3>What is next</h3>
          <p>
            Scheduled email reminders, richer contact metadata, and collaboration workflows so one person’s good
            memory can save an entire family group chat.
          </p>
        </article>
      </section>

      <article className="about-quote">
        <p>
          “Built for people who care deeply, remember inconsistently, and would love fewer apology messages.”
        </p>
      </article>
    </section>
  );
};
