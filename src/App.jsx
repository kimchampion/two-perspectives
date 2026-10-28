import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Flower,
  Brand,
  ChoiceDisplay,
  ExpressionPicker,
  HeroArt,
  Icon,
  Modal,
} from "./components.jsx";
import {
  blankResponses,
  isComplete,
  needsWordingCheck,
  newCode,
  paths,
  scenarios,
  steps,
} from "./data.js";

function Landing({ onCreate, onJoin, onRules }) {
  return (
    <>
      <section className="hero page-width">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <span className="tiny-spark">
              <Flower />
            </span>{" "}
            A LITTLE ROOM FOR ANOTHER VIEW
          </span>
          <h1>
            One story.
            <br />
            <em>Two perspectives.</em>
          </h1>
          <p className="hero-description">
            A playful space for two people to step into a story,
            <br className="desktop-break" /> see it differently, and get a
            little curious.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onCreate}>
              Create a session <Icon name="arrow" size={18} />
            </button>
            <button className="btn btn-outline" onClick={onJoin}>
              Join a session <Icon name="people" size={18} />
            </button>
          </div>
          <div className="hero-meta">
            <span>
              <Icon name="people" size={15} />2 people
            </span>
            <span className="meta-dot">·</span>
            <span>
              <Icon name="clock" size={15} />
              10–15 minutes
            </span>
            <span className="meta-dot">·</span>
            <span>No right answers</span>
          </div>
        </div>
        <HeroArt />
      </section>
      <section
        className="reassurance page-width"
        aria-label="A fictional and private experience"
      >
        <span className="reassurance-icon">
          <Icon name="leaf" size={22} />
        </span>
        <p>
          <strong>Made-up stories. Real curiosity.</strong>
          <span>
            This is a fictional experience, not counseling or conflict
            resolution. Just a new way to see.
          </span>
        </p>
        <span className="reassurance-doodle" aria-hidden="true">
          〰︎
        </span>
      </section>
      <section className="journey page-width" id="how-it-works">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A SMALL JOURNEY, TOGETHER</span>
            <h2>Four cards. A fresh perspective.</h2>
          </div>
          <p>
            You bring the curiosity.
            <br />
            We’ll bring a little structure.
          </p>
        </div>
        <div className="journey-grid">
          {steps.map((step, i) => (
            <article className={`journey-card journey-${i}`} key={step.title}>
              <div className="journey-top">
                <span className="journey-icon">
                  <Icon name={step.icon} size={25} />
                </span>
                <span className="card-number" aria-hidden="true">
                  0{i + 1}
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-bottom page-width" id="ground-rules">
        <span className="bottom-spark">
          <Flower />
        </span>
        <div>
          <h2>A different view doesn’t have to change yours.</h2>
          <p>No winning. No fixing. No agreement required.</p>
        </div>
        <button className="text-button" onClick={onRules}>
          A few ground rules <Icon name="arrow" size={17} />
        </button>
      </section>
    </>
  );
}

function Room({
  code,
  names,
  setNames,
  joined,
  setJoined,
  onContinue,
  onLeave,
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [invalidField, setInvalidField] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const nicknameA = useRef(null);
  const nicknameB = useRef(null);

  useEffect(() => {
    if (!focusTarget) return;
    (focusTarget === "a" ? nicknameA : nicknameB).current?.focus();
    setFocusTarget(null);
  }, [focusTarget, joined]);

  function continueToStory(event) {
    event.preventDefault();
    // Read the form itself: some browsers can autofill visible values without
    // dispatching the change event that updates a controlled React input.
    const form = new FormData(event.currentTarget);
    const nicknames = ["nickname-a", "nickname-b"].map((field) =>
      String(form.get(field) ?? "").trim(),
    );
    setNames(nicknames);
    if (!joined) setJoined(true);
    const missing = nicknames.findIndex((name) => !name);
    if (missing !== -1) {
      setSetupError(
        "Enter a nickname for each person, or try the demo nicknames below.",
      );
      setInvalidField(missing === 0 ? "a" : "b");
      setFocusTarget(missing === 0 ? "a" : "b");
      return;
    }
    if (nicknames[0].toLowerCase() === nicknames[1].toLowerCase()) {
      setSetupError(
        "Choose two different nicknames so each perspective is easy to follow.",
      );
      setInvalidField("b");
      setFocusTarget("b");
      return;
    }
    setSetupError("");
    setInvalidField(null);
    onContinue();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <section className="flow-page page-width">
      <div className="flow-intro">
        <span className="eyebrow">PULL UP TWO CHAIRS</span>
        <h1>A little space for the two of you.</h1>
        <p>
          Choose nicknames, get comfortable, and leave your real names at the
          door.
        </p>
      </div>
      <div className="room-grid">
        <div className="room-card session-card">
          <span className="mini-label">YOUR TEMPORARY SESSION CODE</span>
          <div className="session-code">{code}</div>
          <button className="text-button" onClick={copy}>
            <Icon name={copied ? "check" : "copy"} size={16} />
            {copied ? "Copied!" : "Copy code"}
          </button>
          {copyError && (
            <p className="field-hint" role="status">
              Select the code above to copy it manually.
            </p>
          )}
          <div className="qr-placeholder">
            <svg
              width="75"
              height="75"
              viewBox="0 0 80 80"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 5h22v22H5zM53 5h22v22H53zM5 53h22v22H5z"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                d="M13 13h6v6h-6zM61 13h6v6h-6zM13 61h6v6h-6zM38 5h6v14h-6zM36 27h9v9h-9zM5 37h18v6H5zM30 45h10v20H30zM48 39h13v6H48zM67 35h8v19h-8zM47 53h8v8h-8zM61 63h14v12H61zM45 69h9v6h-9z"
                fill="currentColor"
              />
            </svg>
            <span>
              QR placeholder
              <br />
              <small>Demo only · not scannable</small>
            </span>
          </div>
          <p className="muted small-copy">
            In a connected app, your partner would join with this code. Here,
            you’ll take turns on one device.
          </p>
          <span className="local-pill">
            <span /> LOCAL DEMO · TWO PARTICIPANTS ONLY
          </span>
        </div>
        <form
          className="room-card nickname-card"
          onSubmit={continueToStory}
          noValidate
        >
          <div className="participant-heading">
            <Icon name="people" />
            <h2>Who’s here?</h2>
            <span>2 spots</span>
          </div>
          <p className="nickname-guidance" id="nickname-guidance">
            Choose two different nicknames. Next, you’ll pick a story and begin
            the questions.
          </p>
          <div className="nickname-row">
            <Avatar index={0} />
            <div>
              <label htmlFor="nickname-a">
                Participant A <span>That’s you</span>
              </label>
              <input
                id="nickname-a"
                name="nickname-a"
                ref={nicknameA}
                placeholder="Your nickname"
                maxLength={20}
                autoComplete="off"
                defaultValue={names[0]}
                onChange={(e) => {
                  setNames([e.target.value, names[1]]);
                  setSetupError("");
                  setInvalidField(null);
                }}
                aria-invalid={invalidField === "a" || undefined}
                aria-describedby={
                  setupError
                    ? "nickname-guidance nickname-error"
                    : "nickname-guidance"
                }
                required
              />
              <p className="field-hint">A nickname is plenty.</p>
            </div>
            {names[0].trim() && (
              <Icon name="check" className="ready-check" size={18} />
            )}
          </div>
          {joined ? (
            <div className="nickname-row">
              <Avatar index={1} />
              <div>
                <label htmlFor="nickname-b">
                  Participant B <span>Your partner</span>
                </label>
                <input
                  id="nickname-b"
                  name="nickname-b"
                  ref={nicknameB}
                  placeholder="Partner’s nickname"
                  maxLength={20}
                  autoComplete="off"
                  defaultValue={names[1]}
                  onChange={(e) => {
                    setNames([names[0], e.target.value]);
                    setSetupError("");
                    setInvalidField(null);
                  }}
                  aria-invalid={invalidField === "b" || undefined}
                  aria-describedby={
                    setupError
                      ? "nickname-guidance nickname-error"
                      : "nickname-guidance"
                  }
                  required
                />
                <p className="field-hint">
                  Pass the device so they can choose.
                </p>
              </div>
              {names[1].trim() && (
                <Icon name="check" className="ready-check" size={18} />
              )}
            </div>
          ) : (
            <div className="waiting-partner">
              <span className="empty-avatar">
                <Icon name="people" />
              </span>
              <h3>There’s room for one more.</h3>
              <p>Try both perspectives on this device.</p>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => setJoined(true)}
              >
                Add demo participant <Icon name="arrow" size={16} />
              </button>
            </div>
          )}
          {setupError && (
            <p className="form-error" id="nickname-error" role="alert">
              {setupError}
            </p>
          )}
          <button className="btn btn-primary w-full" type="submit">
            We’re both here <Icon name="arrow" size={18} />
          </button>
          <button
            type="button"
            className="text-button demo-nicknames"
            onClick={() => {
              setNames(["Moss", "Clover"]);
              setJoined(true);
              onContinue();
            }}
          >
            Just exploring? Try demo nicknames
          </button>
          <p className="room-footnote">
            <Icon name="lock" size={13} />
            Nothing is saved beyond this session.
          </p>
        </form>
      </div>
      <button className="text-button back-link" onClick={onLeave}>
        Leave this session
      </button>
    </section>
  );
}

function Setup({ scenarioIndex, setScenarioIndex, onStart, onLeave }) {
  const scenario = scenarios[scenarioIndex];
  const [checked, setChecked] = useState(false);
  return (
    <section className="flow-page page-width">
      <div className="flow-intro">
        <span className="eyebrow">BEFORE WE STEP INSIDE</span>
        <h1>Let’s start with a story.</h1>
        <p>Same moment. Two characters. A different view from each side.</p>
      </div>
      <div className="setup-layout">
        <div className="scenario-selection">
          <div className="section-mini-heading">
            <h2>Pick your scenario</h2>
            <button
              className="text-button"
              onClick={() =>
                setScenarioIndex(
                  (scenarioIndex +
                    1 +
                    Math.floor(Math.random() * (scenarios.length - 1))) %
                    scenarios.length,
                )
              }
            >
              <Icon name="shuffle" size={16} />
              Surprise us
            </button>
          </div>
          <div className="scenario-options">
            {scenarios.map((s, i) => (
              <button
                className={`scenario-option ${scenarioIndex === i ? "selected" : ""}`}
                key={s.id}
                onClick={() => setScenarioIndex(i)}
                aria-pressed={scenarioIndex === i}
              >
                <span className={`scenario-icon scenario-icon-${i}`}>
                  <Icon name={s.icon} size={23} />
                </span>
                <span>
                  <span className="mini-label">{s.category}</span>
                  <strong>{s.title}</strong>
                  <span className="scenario-description">{s.description}</span>
                </span>
                <span className="radio-circle">
                  {scenarioIndex === i && <span />}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="setup-rules">
          <span className="rule-flower">
            <Flower />
          </span>
          <h2>A few things to bring along.</h2>
          <ul>
            <li>
              <Icon name="check" size={17} />
              <span>
                <strong>Stay in the story.</strong> These are fictional people
                and situations, not your own disagreements.
              </span>
            </li>
            <li>
              <Icon name="check" size={17} />
              <span>
                <strong>Be curious, be kind.</strong> Different views can sit
                side by side.
              </span>
            </li>
            <li>
              <Icon name="check" size={17} />
              <span>
                <strong>You set the pace.</strong> Pause or leave at any point.
                No agreement is required.
              </span>
            </li>
          </ul>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>
              We’re here to explore fictional perspectives. This isn’t
              counseling or conflict resolution.
            </span>
          </label>
          <button
            className="btn btn-primary w-full"
            disabled={!checked}
            onClick={onStart}
          >
            Begin with {scenario.title.toLowerCase()}{" "}
            <Icon name="arrow" size={17} />
          </button>
          <button className="text-button setup-leave" onClick={onLeave}>
            Not today? Leave session
          </button>
        </div>
      </div>
    </section>
  );
}

function Progress({ step }) {
  return (
    <nav className="progress-nav" aria-label="Conversation progress">
      <ol>
        {steps.map((s, i) => (
          <li
            className={step === i ? "current" : step > i ? "complete" : ""}
            key={s.short}
            aria-current={step === i ? "step" : undefined}
          >
            <span>
              {step > i ? <Icon name="check" size={14} /> : `0${i + 1}`}
            </span>
            <span>{s.short}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Handoff({ target, names, onContinue, afterSubmit }) {
  return (
    <div className="handoff-card">
      <div className="handoff-art">
        <Avatar index={target} />
        <span className="handoff-lock">
          <Icon name="lock" size={19} />
        </span>
      </div>
      <span className="eyebrow">A LITTLE PRIVACY, PLEASE</span>
      <h2>
        {afterSubmit
          ? "One perspective is ready."
          : "Time for another perspective."}
      </h2>
      <p>
        Pass the device to <strong>{names[target]}</strong>.<br />
        Your partner’s responses stay tucked away until you’re both ready.
      </p>
      <button className="btn btn-primary" onClick={onContinue}>
        I’m {names[target]} <Icon name="arrow" size={18} />
      </button>
      <p className="handoff-footnote">
        Make sure it’s your turn before continuing.
      </p>
    </div>
  );
}

function ResponseForm({
  step,
  active,
  name,
  scenario,
  response,
  setResponse,
  onSubmit,
}) {
  return (
    <form
      className="response-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="form-participant">
        <Avatar index={active} small />
        <span>{name}’s space</span>
        <span className="private-label">
          <Icon name="lock" size={13} />
          Only you, for now
        </span>
      </div>
      <h2>
        {steps[step].title}
        {step === 0 ? "." : ""}
      </h2>
      <p className="form-description">{steps[step].description}</p>
      {step === 1 && (
        <div className={`perspective-card perspective-${active}`}>
          <span className="mini-label">
            <Icon name="eye" size={15} />
            YOUR CHARACTER’S PERSPECTIVE · {active === 0 ? "A" : "B"}
          </span>
          <p>{scenario.perspectives[active]}</p>
          <span className="field-hint">
            Imagine you’re this person. You don’t have to agree with them.
          </span>
        </div>
      )}
      {(step === 0 || step === 3) && (
        <ExpressionPicker
          response={response}
          setResponse={setResponse}
          after={step === 3}
        />
      )}
      {step === 2 && (
        <fieldset className="path-picker">
          <legend>What would you choose for your character?</legend>
          {paths.map((path) => (
            <button
              key={path.value}
              type="button"
              aria-pressed={response.choice === path.value}
              className={`path-option ${response.choice === path.value ? "selected" : ""}`}
              onClick={() => setResponse({ ...response, choice: path.value })}
            >
              <span className="path-icon">
                <Icon name={path.icon} size={21} />
              </span>
              <span>
                <strong>{path.value}</strong>
                <small>{path.description}</small>
              </span>
              <span className="radio-circle">
                {response.choice === path.value && <span />}
              </span>
            </button>
          ))}
        </fieldset>
      )}
      <label className="reflection-label" htmlFor="reflection">
        {step === 0
          ? "What does this choice represent for you?"
          : step === 1
            ? "What happened, from your character’s point of view?"
            : step === 2
              ? "Why does this path feel right?"
              : "After hearing the other side, what do you notice?"}
      </label>
      <textarea
        id="reflection"
        value={response.text}
        maxLength={1200}
        required
        placeholder={
          step === 0
            ? "Right now, this feels like…"
            : step === 1
              ? "From where I’m standing…"
              : step === 2
                ? "I’d choose this because…"
                : "Something shifted, or maybe it didn’t…"
        }
        onChange={(e) => setResponse({ ...response, text: e.target.value })}
        rows={4}
      />
      <div className="textarea-foot">
        <span>Keep it kind. Keep it in the story.</span>
        <span>{response.text.length}/1200</span>
      </div>
      <div className="form-submit">
        <p>
          <Icon name="lock" size={14} />
          Revealed only when you both submit.
        </p>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!isComplete(step, response)}
        >
          I’m ready to share <Icon name="arrow" size={17} />
        </button>
      </div>
    </form>
  );
}

function Reveal({ step, responses, names, onNext }) {
  return (
    <div className="reveal">
      <div className="reveal-heading">
        <span className="reveal-symbol">
          <Flower />
        </span>
        <span className="eyebrow">BOTH PERSPECTIVES ARE HERE</span>
        <h2>
          {step === 0
            ? "Two starting points."
            : step === 1
              ? "Same story. Different sides."
              : step === 2
                ? "Two ways forward."
                : "A little room for change."}
        </h2>
        <p>
          {step === 2
            ? "Your paths don’t have to match. There’s room for both."
            : step === 3
              ? "Notice the difference, or the things that stayed the same."
              : "Take a moment to read each other’s words. Just listen first."}
        </p>
      </div>
      <div className="reveal-grid">
        {names.map((name, i) => (
          <article className={`reveal-card reveal-${i}`} key={i}>
            <div className="reveal-person">
              <Avatar index={i} small />
              <h3>{name}</h3>
              <span>Perspective {i === 0 ? "A" : "B"}</span>
            </div>
            {step === 3 ? (
              <div className="before-after">
                <div>
                  <span className="mini-label">BEFORE</span>
                  <ChoiceDisplay response={responses[0][i]} compact />
                </div>
                <Icon name="arrow" size={17} />
                <div>
                  <span className="mini-label">NOW</span>
                  <ChoiceDisplay response={responses[3][i]} compact />
                </div>
              </div>
            ) : step === 2 ? (
              <div className="chosen-path">
                <Icon
                  name={
                    paths.find((p) => p.value === responses[step][i].choice)
                      ?.icon
                  }
                  size={24}
                />
                <strong>{responses[step][i].choice}</strong>
              </div>
            ) : step === 0 ? (
              <ChoiceDisplay response={responses[step][i]} />
            ) : (
              <span className="mini-label perspective-label">
                IN THEIR CHARACTER’S SHOES
              </span>
            )}
            <p className="response-quote">{responses[step][i].text}</p>
          </article>
        ))}
      </div>
      <div className="reveal-bottom">
        <p>
          <Icon name="heart" size={16} />
          {step === 1
            ? "What’s one thing you hadn’t considered?"
            : "You can be different and still be here together."}
        </p>
        <button className="btn btn-primary" onClick={onNext}>
          {step === 3 ? "See our reflection" : `On to card ${step + 2}`}
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </div>
  );
}

function Conversation({
  step,
  active,
  names,
  scenario,
  responses,
  submitted,
  handoff,
  setHandoff,
  onSwitch,
  setActive,
  updateResponse,
  onSubmit,
  onNext,
}) {
  const revealed = submitted[step].every(Boolean);
  return (
    <section className="conversation page-width">
      <Progress step={step} />
      <div className="conversation-layout">
        <aside className="story-sidebar">
          <span className="eyebrow">YOUR SHARED STORY</span>
          <div className="story-icon">
            <Icon name={scenario.icon} size={28} />
          </div>
          <h2>{scenario.title}</h2>
          <p>{scenario.story}</p>
          <span className="fiction-tag">FICTIONAL SCENARIO</span>
          <div className="sidebar-divider" />
          <span className="mini-label">AT THE TABLE</span>
          <div className="status-list" aria-live="polite">
            {names.map((n, i) => (
              <div key={i}>
                <Avatar index={i} small />
                <strong>{n}</strong>
                <span
                  className={
                    submitted[step][i] ? "status-ready" : "status-thinking"
                  }
                >
                  {submitted[step][i] ? (
                    <>
                      <Icon name="check" size={12} />
                      Ready
                    </>
                  ) : (
                    "Thinking"
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="sidebar-note">
            <Icon name="leaf" size={19} />
            <p>
              This isn’t about being right.
              <br />
              It’s about looking a little closer.
            </p>
          </div>
        </aside>
        <div className="conversation-main">
          {!revealed && !handoff && (
            <div className="participant-switcher">
              <span>YOUR TURN</span>
              <div>
                {names.map((name, i) => (
                  <button
                    key={i}
                    className={active === i ? "active" : ""}
                    onClick={() => {
                      if (i !== active) onSwitch(i);
                    }}
                    aria-pressed={active === i}
                  >
                    <span className={`player-dot player-${i}`} />
                    {name}
                    {active === i && <Icon name="check" size={13} />}
                  </button>
                ))}
              </div>
            </div>
          )}
          {handoff ? (
            <Handoff
              names={names}
              target={handoff.target}
              afterSubmit={handoff.afterSubmit}
              onContinue={() => {
                setActive(handoff.target);
                setHandoff(null);
              }}
            />
          ) : revealed ? (
            <Reveal
              step={step}
              names={names}
              responses={responses}
              onNext={onNext}
            />
          ) : submitted[step][active] ? (
            <div className="handoff-card">
              <Icon name="check" size={32} />
              <h2>Your perspective is tucked away.</h2>
              <p>Ready when your partner is.</p>
              <button
                className="btn btn-primary"
                onClick={() => onSwitch(1 - active)}
              >
                Pass to {names[1 - active]}
                <Icon name="arrow" size={17} />
              </button>
            </div>
          ) : (
            <ResponseForm
              key={`${step}-${active}`}
              step={step}
              active={active}
              name={names[active]}
              scenario={scenario}
              response={responses[step][active]}
              setResponse={updateResponse}
              onSubmit={onSubmit}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Summary({ names, responses, scenario, onRestart, onEnd }) {
  return (
    <section className="summary-page page-width">
      <div className="flow-intro">
        <span className="summary-flower">
          <Flower />
        </span>
        <span className="eyebrow">A MOMENT TO LOOK BACK</span>
        <h1>Two views. A little more room.</h1>
        <p>
          You explored <strong>{scenario.title.toLowerCase()}</strong> together.
          <br />
          You don’t have to agree for this time to have mattered.
        </p>
      </div>
      <div className="summary-grid">
        {names.map((name, i) => (
          <article className={`summary-card summary-${i}`} key={i}>
            <div className="reveal-person">
              <Avatar index={i} />
              <h2>{name}’s reflection</h2>
            </div>
            <div className="before-after">
              <div>
                <span className="mini-label">WHERE I STARTED</span>
                <ChoiceDisplay response={responses[0][i]} compact />
              </div>
              <Icon name="arrow" size={18} />
              <div>
                <span className="mini-label">WHERE I AM NOW</span>
                <ChoiceDisplay response={responses[3][i]} compact />
              </div>
            </div>
            <div className="summary-section">
              <h3>Before we began</h3>
              <p>{responses[0][i].text}</p>
            </div>
            <div className="summary-section">
              <h3>My character’s perspective</h3>
              <p>{responses[1][i].text}</p>
            </div>
            <div className="summary-section">
              <h3>The path I chose</h3>
              <span className="summary-path">
                <Icon
                  name={
                    paths.find((p) => p.value === responses[2][i].choice)?.icon
                  }
                  size={17}
                />
                {responses[2][i].choice}
              </span>
              <p>{responses[2][i].text}</p>
            </div>
            <div className="summary-section">
              <h3>What I noticed</h3>
              <p>{responses[3][i].text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="summary-outro">
        <Icon name="leaf" size={26} />
        <h2>Curiosity counts. Agreement is optional.</h2>
        <p>
          Take what you noticed with you. Your responses stay here until you
          leave.
        </p>
        <div className="summary-actions">
          <button className="btn btn-outline" onClick={onRestart}>
            <Icon name="reset" size={17} />
            Explore another story
          </button>
          <button className="btn btn-primary" onClick={onEnd}>
            End session <Icon name="arrow" size={17} />
          </button>
        </div>
        <span className="privacy-footnote">
          <Icon name="lock" size={14} />
          Ending or refreshing clears every response.
        </span>
      </div>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [modal, setModal] = useState(null);
  const [code, setCode] = useState(newCode);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [names, setNames] = useState(["", ""]);
  const [joined, setJoined] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(0);
  const [responses, setResponses] = useState(blankResponses);
  const [submitted, setSubmitted] = useState(() =>
    Array.from({ length: 4 }, () => [false, false]),
  );
  const [handoff, setHandoff] = useState(null);
  const [notice, setNotice] = useState("");
  const mainRef = useRef(null);
  const inSession = ["room", "setup", "play", "summary"].includes(view);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus();
  }, [view, step, handoff, active]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    if (!inSession) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [inSession]);
  function clearResponses() {
    setResponses(blankResponses());
    setSubmitted(Array.from({ length: 4 }, () => [false, false]));
    setStep(0);
    setActive(0);
    setHandoff(null);
  }
  function create() {
    clearResponses();
    setCode(newCode());
    setNames(["", ""]);
    setJoined(false);
    setView("room");
  }
  function end() {
    clearResponses();
    setNames(["", ""]);
    setJoined(false);
    setCode(newCode());
    setJoinCode("");
    setModal(null);
    setView("ended");
  }
  function restart() {
    clearResponses();
    setModal(null);
    setView("setup");
  }
  function updateResponse(response) {
    setResponses((prev) =>
      prev.map((pair, i) =>
        i === step ? pair.map((r, j) => (j === active ? response : r)) : pair,
      ),
    );
  }
  function submit(skipCheck = false) {
    if (!isComplete(step, responses[step][active])) return;
    if (!skipCheck && needsWordingCheck(responses[step][active].text)) {
      setModal("safety");
      return;
    }
    setSubmitted((prev) =>
      prev.map((pair, i) =>
        i === step ? pair.map((v, j) => (j === active ? true : v)) : pair,
      ),
    );
    if (!submitted[step][1 - active])
      setHandoff({ target: 1 - active, afterSubmit: true });
    setModal(null);
  }
  function next() {
    if (step === 3) setView("summary");
    else {
      setStep(step + 1);
      setHandoff({ target: 0, afterSubmit: false });
    }
  }
  function join(e) {
    e.preventDefault();
    const value = joinCode.trim().toUpperCase();
    if (value !== "DEMO24" && value !== code) {
      setJoinError(
        "That code isn’t available on this device. Use DEMO24 to explore a local session.",
      );
      return;
    }
    clearResponses();
    setCode(value);
    setNames(["", ""]);
    setJoined(true);
    setModal(null);
    setJoinError("");
    setView("room");
  }
  function home() {
    if (inSession) setModal("end");
    else setView("home");
  }
  return (
    <div className="app-shell min-h-screen flex flex-col">
      <header className="site-header">
        <div className="header-inner page-width">
          <Brand onClick={home} />
          {!inSession ? (
            <nav aria-label="Main navigation" className="header-nav">
              {view === "home" ? (
                <a href="#how-it-works">How it works</a>
              ) : (
                <button onClick={() => setModal("how")}>How it works</button>
              )}
              <button onClick={() => setModal("rules")}>
                The ground rules
              </button>
              <span className="demo-badge">
                <span />A two-person experience
              </span>
            </nav>
          ) : (
            <div className="session-header">
              <span className="session-header-code">
                <span className="live-dot" />
                Session <strong>{code}</strong>
              </span>
              <span className="demo-header-label">SAME-DEVICE DEMO</span>
              <button
                className="pause-button"
                aria-label="Take a pause"
                onClick={() => setModal("pause")}
              >
                <Icon name="pause" size={17} />
                <span>Take a pause</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {view === "home" && (
          <Landing
            onCreate={create}
            onJoin={() => {
              setJoinCode("");
              setJoinError("");
              setModal("join");
            }}
            onRules={() => setModal("rules")}
          />
        )}
        {view === "room" && (
          <Room
            code={code}
            names={names}
            setNames={setNames}
            joined={joined}
            setJoined={setJoined}
            onContinue={() => setView("setup")}
            onLeave={() => setModal("end")}
          />
        )}
        {view === "setup" && (
          <Setup
            scenarioIndex={scenarioIndex}
            setScenarioIndex={setScenarioIndex}
            onStart={() => {
              setView("play");
              setHandoff({ target: 0, afterSubmit: false });
            }}
            onLeave={() => setModal("end")}
          />
        )}
        {view === "play" && (
          <Conversation
            step={step}
            active={active}
            names={names}
            scenario={scenarios[scenarioIndex]}
            responses={responses}
            submitted={submitted}
            handoff={handoff}
            setHandoff={setHandoff}
            onSwitch={(target) => setHandoff({ target, afterSubmit: false })}
            setActive={setActive}
            updateResponse={updateResponse}
            onSubmit={() => submit()}
            onNext={next}
          />
        )}
        {view === "summary" && (
          <Summary
            names={names}
            responses={responses}
            scenario={scenarios[scenarioIndex]}
            onRestart={() => setModal("restart")}
            onEnd={() => setModal("end")}
          />
        )}
        {view === "ended" && (
          <section className="ended-page page-width">
            <span className="ended-flower">
              <Flower />
            </span>
            <span className="eyebrow">THANKS FOR GETTING CURIOUS</span>
            <h1>A little perspective goes a long way.</h1>
            <p>
              Your session is closed and all responses have been cleared.
              <br />
              Nothing to save. Just something to think about.
            </p>
            <button className="btn btn-primary" onClick={() => setView("home")}>
              Back to the beginning <Icon name="arrow" size={17} />
            </button>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div className="footer-inner page-width">
          <span className="footer-brand">two perspectives.</span>
          <p>
            <Icon name="lock" size={13} />
            Just here, just now. No accounts. Nothing saved.
          </p>
          <span className="footer-label">
            A FICTIONAL EXPERIENCE, MADE FOR CURIOSITY.
          </span>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      {modal === "join" && (
        <Modal
          title="Your other perspective awaits."
          onClose={() => setModal(null)}
        >
          <p>
            Joining someone? Enter the temporary code. This prototype works on
            one device, taking turns.
          </p>
          <form onSubmit={join}>
            <label className="reflection-label" htmlFor="join-code">
              Session code
            </label>
            <input
              id="join-code"
              className="join-code-input"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setJoinError("");
              }}
              placeholder="e.g. DEMO24"
              maxLength={6}
              minLength={6}
              required
              autoComplete="off"
              aria-describedby="join-help"
              autoFocus
            />
            {joinError && (
              <p className="form-error" role="alert">
                {joinError}
              </p>
            )}
            <p className="field-hint" id="join-help">
              No code? Enter{" "}
              <button
                type="button"
                className="inline-code"
                onClick={() => setJoinCode("DEMO24")}
              >
                DEMO24
              </button>{" "}
              to try both sides here. Codes don’t connect separate devices.
            </p>
            <button className="btn btn-primary w-full" type="submit">
              Join local session <Icon name="arrow" size={17} />
            </button>
          </form>
        </Modal>
      )}
      {(modal === "rules" || modal === "how") && (
        <Modal
          title={
            modal === "rules"
              ? "A few ground rules."
              : "Four cards. Two perspectives."
          }
          onClose={() => setModal(null)}
        >
          <p>
            A playful classroom prototype for exploring made-up situations
            together.
          </p>
          <ul className="modal-rules">
            {(modal === "rules"
              ? [
                  [
                    "leaf",
                    "Keep it fictional.",
                    "Step into the seeded characters’ shoes, rather than using a real disagreement.",
                  ],
                  [
                    "heart",
                    "Curiosity over certainty.",
                    "Keep your words kind. Neither person needs to change their mind.",
                  ],
                  [
                    "pause",
                    "Your pace, your choice.",
                    "Pause, restart, or leave whenever you like. This isn’t counseling or conflict resolution.",
                  ],
                  [
                    "lock",
                    "Just here, just now.",
                    "Responses stay in this page’s memory. Refreshing or ending clears them. Same-device privacy is a turn-taking convention, not secure storage.",
                  ],
                ]
              : steps.map((s) => [s.icon, s.title, s.description])
            ).map(([icon, title, body]) => (
              <li key={title}>
                <span>
                  <Icon name={icon} size={21} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary w-full"
            onClick={() => setModal(null)}
          >
            A little curiosity. That’s all. <Icon name="check" size={17} />
          </button>
        </Modal>
      )}
      {modal === "pause" && (
        <Modal title="There’s no rush." onClose={() => setModal(null)}>
          <div className="pause-illustration">
            <Icon name="coffee" size={38} />
          </div>
          <p>
            Take a breath, stretch a little, or put the device down. Your place
            is safe while this page stays open.
          </p>
          <div className="pause-options">
            <button
              className="btn btn-primary w-full"
              onClick={() => setModal(null)}
            >
              <Icon name="play" size={17} />
              Keep going
            </button>
            <button className="pause-option" onClick={() => setModal("paused")}>
              <Icon name="pause" />
              Pause and hide responses
              <Icon name="chevron" size={16} />
            </button>
            {view === "play" && step > 0 && (
              <button
                className="pause-option"
                onClick={() => {
                  setStep(step - 1);
                  setHandoff(null);
                  setModal(null);
                }}
              >
                <Icon name="reset" />
                Go back a card
                <Icon name="chevron" size={16} />
              </button>
            )}
            <button
              className="pause-option"
              onClick={() => setModal("restart")}
            >
              <Icon name="reset" />
              Start a fresh story
              <Icon name="chevron" size={16} />
            </button>
            <button className="pause-option" onClick={() => setModal("end")}>
              <Icon name="exit" />
              Leave this session
              <Icon name="chevron" size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "paused" && (
        <Modal
          title="A little room to breathe."
          onClose={() => setModal(null)}
          className="paused-modal"
        >
          <div className="paused-flower">
            <Flower />
          </div>
          <p>
            Your session is paused. No timer, no pressure.
            <br />
            Come back when you’re both ready.
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => setModal(null)}
          >
            <Icon name="play" size={17} />
            We’re ready to continue
          </button>
        </Modal>
      )}
      {modal === "safety" && (
        <Modal title="A quick wording check." onClose={() => setModal(null)}>
          <span className="safety-icon">
            <Icon name="leaf" size={30} />
          </span>
          <p>
            A simple demo check noticed wording that might feel harsh. Could you
            describe the character’s experience with a little more care?
          </p>
          <p className="field-hint">
            This is a limited keyword placeholder, not a safety or moderation
            service. Context can be missed.
          </p>
          <div className="pause-options">
            <button
              className="btn btn-primary w-full"
              onClick={() => setModal(null)}
            >
              Go back and edit <Icon name="pencil" size={17} />
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={() => setModal("paused")}
            >
              Take a pause
            </button>
            <button className="text-button" onClick={() => setModal("end")}>
              Leave session
            </button>
          </div>
        </Modal>
      )}
      {modal === "restart" && (
        <Modal title="Room for a fresh start?" onClose={() => setModal(null)}>
          <p>
            We’ll clear both people’s responses and let you pick another
            scenario. Your nicknames and session code will stay.
          </p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setModal(null)}>
              Keep our place
            </button>
            <button className="btn btn-primary" onClick={restart}>
              Start over <Icon name="reset" size={17} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "end" && (
        <Modal
          title="Ready to close this chapter?"
          onClose={() => setModal(null)}
        >
          <p>
            Ending the session clears both people’s responses and nicknames.
            Nothing is saved, and you can always begin again.
          </p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setModal(null)}>
              Stay a little longer
            </button>
            <button className="btn btn-primary" onClick={end}>
              End session <Icon name="exit" size={17} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
