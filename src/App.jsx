import { useCallback, useEffect, useMemo, useState } from "react";
import StateDiagram from "./StateDiagram";

const PRESETS = [
  {
    id: "anbn",
    label: "aⁿbⁿ — Equal a's and b's",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push one 'A' onto stack for every 'a' read
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A" },
      // Pop one 'A' from stack for every 'b' read
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      // Stack back to Z0 means equal count — accept
      { currentState: "q0", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
      { currentState: "q1", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "palindrome",
    label: "wcwᴿ — Palindrome with center marker c",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push A for 'a', B for 'b' in first half
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A" },
      { currentState: "q0", inputSymbol: "a", stackTop: "B",  nextState: "q0", pushSymbols: "A B" },
      { currentState: "q0", inputSymbol: "b", stackTop: "Z0", nextState: "q0", pushSymbols: "B Z0" },
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q0", pushSymbols: "B A" },
      { currentState: "q0", inputSymbol: "b", stackTop: "B",  nextState: "q0", pushSymbols: "B B" },
      // Center marker 'c' — switch to pop mode (q1)
      { currentState: "q0", inputSymbol: "c", stackTop: "Z0", nextState: "q1", pushSymbols: "Z0" },
      { currentState: "q0", inputSymbol: "c", stackTop: "A",  nextState: "q1", pushSymbols: "A" },
      { currentState: "q0", inputSymbol: "c", stackTop: "B",  nextState: "q1", pushSymbols: "B" },
      // Match second half: pop A for 'a', pop B for 'b'
      { currentState: "q1", inputSymbol: "a", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "b", stackTop: "B",  nextState: "q1", pushSymbols: "e" },
      // Stack cleared back to Z0 — palindrome confirmed
      { currentState: "q1", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "parens",
    label: "Balanced Parentheses ( )",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push 'P' (for Paren) on every '('
      { currentState: "q0", inputSymbol: "(", stackTop: "Z0", nextState: "q0", pushSymbols: "P Z0" },
      { currentState: "q0", inputSymbol: "(", stackTop: "P",  nextState: "q0", pushSymbols: "P P" },
      // Pop 'P' on every ')' — must match
      { currentState: "q0", inputSymbol: ")", stackTop: "P",  nextState: "q0", pushSymbols: "e" },
      // Stack back to Z0 — all parens balanced
      { currentState: "q0", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "an2bn",
    label: "aⁿb²ⁿ — One a for every two b's",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push TWO 'A' markers for every single 'a'
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A A" },
      // Pop ONE 'A' for every 'b'
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      // Stack cleared — accept
      { currentState: "q1", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "a2nbn",
    label: "a²ⁿbⁿ — Two a's for every b",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push ONE 'A' for every 'a'
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A" },
      // Each 'b' pops TWO 'A's (via intermediate state q1)
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "e", stackTop: "A",  nextState: "q0", pushSymbols: "e" },
      // All b's consumed, stack clear — accept
      { currentState: "q0", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "anlembn",
    label: "aⁿbᵐ (n ≤ m) — At most as many a's as b's",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push 'A' for every 'a'
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A" },
      // Pop 'A' for each matching 'b'
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      // Extra b's when no a's on stack — move to q2
      { currentState: "q0", inputSymbol: "b", stackTop: "Z0", nextState: "q2", pushSymbols: "Z0" },
      { currentState: "q1", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "b", stackTop: "Z0", nextState: "q2", pushSymbols: "Z0" },
      { currentState: "q2", inputSymbol: "b", stackTop: "Z0", nextState: "q2", pushSymbols: "Z0" },
      // Accept in any state when input done and stack is Z0
      { currentState: "q0", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
      { currentState: "q1", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
      { currentState: "q2", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "angembn",
    label: "aⁿbᵐ (n ≥ m ≥ 1) — At least as many a's as b's",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push 'A' for every 'a'
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A" },
      // Pop 'A' for each 'b' — must have at least one b
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      // Accept when b's done — remaining A's on stack is fine (n > m)
      { currentState: "q1", inputSymbol: "e", stackTop: "A",  nextState: "q_accept", pushSymbols: "A" },
      { currentState: "q1", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "anbncm",
    label: "aⁿbⁿcᵐ — Equal a's & b's, any number of c's",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push 'A' for every 'a'
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "A Z0" },
      { currentState: "q0", inputSymbol: "a", stackTop: "A",  nextState: "q0", pushSymbols: "A A" },
      // Pop 'A' for each matching 'b'
      { currentState: "q0", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      { currentState: "q1", inputSymbol: "b", stackTop: "A",  nextState: "q1", pushSymbols: "e" },
      // a's = b's and no c's — accept
      { currentState: "q1", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
      // Consume any number of trailing c's in q2
      { currentState: "q1", inputSymbol: "c", stackTop: "Z0", nextState: "q2", pushSymbols: "Z0" },
      { currentState: "q2", inputSymbol: "c", stackTop: "Z0", nextState: "q2", pushSymbols: "Z0" },
      { currentState: "q2", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "ambncn",
    label: "aᵐbⁿcⁿ — Any number of a's, equal b's & c's",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Skip any number of a's (stack unchanged)
      { currentState: "q0", inputSymbol: "a", stackTop: "Z0", nextState: "q0", pushSymbols: "Z0" },
      // Push 'B' for every 'b'
      { currentState: "q0", inputSymbol: "b", stackTop: "Z0", nextState: "q1", pushSymbols: "B Z0" },
      { currentState: "q1", inputSymbol: "b", stackTop: "B",  nextState: "q1", pushSymbols: "B B" },
      // Pop 'B' for each matching 'c'
      { currentState: "q1", inputSymbol: "c", stackTop: "B",  nextState: "q2", pushSymbols: "e" },
      { currentState: "q2", inputSymbol: "c", stackTop: "B",  nextState: "q2", pushSymbols: "e" },
      // All b's matched c's — accept
      { currentState: "q2", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
      // Accept with just a's and no b's/c's
      { currentState: "q0", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
  {
    id: "balanced2",
    label: "Balanced ( ) and { } Brackets",
    startState: "q0",
    acceptStates: "q_accept",
    initialStack: "Z0",
    rules: [
      // Push 'P' (Parenthesis) for '(' and 'C' (Curly) for '{'
      { currentState: "q0", inputSymbol: "(", stackTop: "Z0", nextState: "q0", pushSymbols: "P Z0" },
      { currentState: "q0", inputSymbol: "(", stackTop: "P",  nextState: "q0", pushSymbols: "P P" },
      { currentState: "q0", inputSymbol: "(", stackTop: "C",  nextState: "q0", pushSymbols: "P C" },
      { currentState: "q0", inputSymbol: "{", stackTop: "Z0", nextState: "q0", pushSymbols: "C Z0" },
      { currentState: "q0", inputSymbol: "{", stackTop: "C",  nextState: "q0", pushSymbols: "C C" },
      { currentState: "q0", inputSymbol: "{", stackTop: "P",  nextState: "q0", pushSymbols: "C P" },
      // Pop 'P' for ')' and 'C' for '}' — type must match!
      { currentState: "q0", inputSymbol: ")", stackTop: "P",  nextState: "q0", pushSymbols: "e" },
      { currentState: "q0", inputSymbol: "}", stackTop: "C",  nextState: "q0", pushSymbols: "e" },
      // All brackets matched — accept
      { currentState: "q0", inputSymbol: "e", stackTop: "Z0", nextState: "q_accept", pushSymbols: "Z0" },
    ],
  },
];

export default function App() {
  const [startState, setStartState] = useState("q0");
  const [acceptStatesText, setAcceptStatesText] = useState("q_accept");
  const [initialStackSymbol, setInitialStackSymbol] = useState("Z0");

  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    currentState: "q0",
    inputSymbol: "e",
    stackTop: "Z0",
    nextState: "q_accept",
    pushSymbols: "",
  });

  const [selectedPreset, setSelectedPreset] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");

  const [inputField, setInputField] = useState("");
  const [inputString, setInputString] = useState("");
  const [pointer, setPointer] = useState(0);
  const [currentState, setCurrentState] = useState(startState);
  const [stack, setStack] = useState([initialStackSymbol]);
  const [status, setStatus] = useState("Idle");
  const [playActive, setPlayActive] = useState(false);

  const acceptStates = useMemo(
    () =>
      acceptStatesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [acceptStatesText],
  );

  const currentInputChar = inputString[pointer] ?? "";
  const topOfStack = stack[stack.length - 1] ?? "";

  const parsePushSymbols = useCallback((value) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "e" || trimmed === "ε") {
      return [];
    }

    return trimmed.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  }, []);

  const findMatchingRule = useCallback(() => {
    const candidates = rules.filter(
      (rule) =>
        rule.currentState === currentState && rule.stackTop === topOfStack,
    );

    const exactMatch = candidates.find(
      (rule) => rule.inputSymbol === currentInputChar,
    );
    if (exactMatch) {
      return exactMatch;
    }
    return candidates.find((rule) => rule.inputSymbol === "e");
  }, [rules, currentState, topOfStack, currentInputChar]);

  const handleStep = useCallback(() => {
    if (status === "Accepted" || status === "Rejected") {
      return;
    }

    const rule = findMatchingRule();
    if (!rule) {
      if (
        pointer >= inputString.length &&
        acceptStates.includes(currentState)
      ) {
        setStatus("Accepted");
      } else {
        setStatus("Rejected");
      }
      setPlayActive(false);
      return;
    }

    const nextStack = [...stack];
    if (nextStack.length > 0) {
      nextStack.pop();
    }

    const pushSymbols = parsePushSymbols(rule.pushSymbols);
    for (let i = pushSymbols.length - 1; i >= 0; i -= 1) {
      nextStack.push(pushSymbols[i]);
    }

    const nextPointer = rule.inputSymbol === "e" ? pointer : pointer + 1;

    // Only accept when ALL input consumed AND next state is accept state
    // AND no more epsilon rules can still fire (i.e. reached a clean accept)
    const inputDone = nextPointer >= inputString.length;
    const nextStatus = inputDone && acceptStates.includes(rule.nextState)
      ? "Accepted"
      : "Running";

    setCurrentState(rule.nextState);
    setStack(nextStack.length > 0 ? nextStack : []);
    setPointer(nextPointer);
    setStatus(nextStatus);

    if (nextStatus === "Accepted") {
      setPlayActive(false);
    }
  }, [
    status,
    stack,
    pointer,
    currentState,   
    inputString,
    acceptStates,
    findMatchingRule,
    parsePushSymbols,
  ]);

  const resetSimulation = useCallback(() => {
    setCurrentState(startState);
    setPointer(0);
    setStack([initialStackSymbol]);
    setStatus("Idle");
    setPlayActive(false);
    setInputString("");
  }, [startState, initialStackSymbol]);

  useEffect(() => {
    if (!playActive) {
      return;
    }

    const timer = window.setTimeout(() => {
      handleStep();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [playActive, status, handleStep]);

  const addRule = () => {
    const rule = {
      currentState: newRule.currentState.trim() || "q0",
      inputSymbol: newRule.inputSymbol.trim() || "e",
      stackTop: newRule.stackTop.trim() || initialStackSymbol,
      nextState: newRule.nextState.trim() || "q_accept",
      pushSymbols: newRule.pushSymbols,
    };

    setRules((prev) => [...prev, rule]);
    setNewRule((prev) => ({ ...prev, pushSymbols: "" }));
  };

  const loadPreset = () => {
    const preset = PRESETS.find((p) => p.id === selectedPreset);
    if (!preset) return;
    setStartState(preset.startState);
    setAcceptStatesText(preset.acceptStates);
    setInitialStackSymbol(preset.initialStack);
    setRules(preset.rules);
    setCurrentState(preset.startState);
    setStack([preset.initialStack]);
    setStatus("Idle");
    setPlayActive(false);
    setInputString("");
    setInputField("");
    setPointer(0);
  };

  const importBulk = () => {
    setBulkError("");
    setBulkSuccess("");
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));

    if (lines.length === 0) {
      setBulkError("No rules found. Please enter at least one rule.");
      return;
    }

    const parsed = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split("->");
      if (parts.length !== 2) {
        setBulkError(`Line ${i + 1}: Missing "->". Format: currentState, input, stackTop -> nextState, pushSymbols`);
        return;
      }
      const left = parts[0].split(",").map((s) => s.trim());
      const right = parts[1].split(",").map((s) => s.trim());
      if (left.length !== 3) {
        setBulkError(`Line ${i + 1}: Left side must have 3 parts: currentState, inputSymbol, stackTop`);
        return;
      }
      if (right.length < 1) {
        setBulkError(`Line ${i + 1}: Right side must have at least nextState.`);
        return;
      }
      const pushSymbols = right.slice(1).join(" ").trim();
      parsed.push({
        currentState: left[0],
        inputSymbol: left[1],
        stackTop: left[2],
        nextState: right[0],
        pushSymbols,
      });
    }
    setRules((prev) => [...prev, ...parsed]);
    setBulkSuccess(`✓ ${parsed.length} rule${parsed.length > 1 ? "s" : ""} imported successfully!`);
    setBulkText("");
  };

  const loadString = () => {
    setInputString(inputField);
    setPointer(0);
    setCurrentState(startState);
    setStack([initialStackSymbol]);
    setPlayActive(false);

    if (
      inputField.length === 0 &&
      acceptStatesText
        .split(",")
        .map((s) => s.trim())
        .includes(startState)
    ) {
      setStatus("Accepted");
    } else {
      setStatus("Idle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-28">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Universal PDA Simulator</h1>
            <p className="text-slate-400 mt-1">
              Build transition rules dynamically and test strings step-by-step.
            </p>
          </div>
        </header>

        {/* Notes - full width, items in 3 cols */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
          <h3 className="text-xl font-semibold">📌 Notes</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 text-sm text-slate-400">
            <div className="rounded-2xl bg-slate-800/40 px-4 py-3">
              <strong className="text-slate-300">Deterministic Execution</strong>
              <p className="mt-1">The first exact-match rule fires. If none matches, an epsilon (ε) transition is tried.</p>
            </div>
            <div className="rounded-2xl bg-slate-800/40 px-4 py-3">
              <strong className="text-slate-300">Epsilon Transitions</strong>
              <p className="mt-1">Use <code>e</code> or <code>ε</code> in the Input Symbol field for transitions that don't consume input.</p>
            </div>
            <div className="rounded-2xl bg-slate-800/40 px-4 py-3">
              <strong className="text-slate-300">Pushing Multiple Symbols</strong>
              <p className="mt-1">Separate with spaces or commas: <code>A Z0</code> or <code>A, Z0</code>. Leftmost becomes the new stack top.</p>
            </div>
            <div className="rounded-2xl bg-slate-800/40 px-4 py-3">
              <strong className="text-slate-300">Popping Only</strong>
              <p className="mt-1">Leave <em>"Symbols to Push/Pop"</em> empty or enter <code>e</code> to pop without pushing.</p>
            </div>
            <div className="rounded-2xl bg-slate-800/40 px-4 py-3 sm:col-span-2 xl:col-span-2">
              <strong className="text-slate-300">Acceptance Condition</strong>
              <p className="mt-1">The PDA accepts only when the <em>entire</em> input string is consumed AND the machine is in one of the designated accept states.</p>
            </div>
          </div>
        </div>

        {/* How to Use - full width, 3 method columns + run steps */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
          <h3 className="text-xl font-semibold">🚀 How to Use the Simulator</h3>
          <p className="mt-1 text-sm text-slate-400">
            There are <strong className="text-slate-300">3 ways</strong> to load rules into the machine — choose whichever is fastest.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {/* Method 1 */}
            <div className="rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-4 text-sm text-slate-400">
              <p className="font-semibold text-cyan-300 text-base">⚡ Method 1</p>
              <p className="font-medium text-slate-300 mt-0.5">Quick Load Preset</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>In Machine Builder, find <strong className="text-slate-300">⚡ Quick Load Preset</strong>.</li>
                <li>Pick a language from the dropdown.</li>
                <li>Click <strong className="text-slate-300">Load Preset</strong>.</li>
                <li>All rules + settings load instantly!</li>
              </ol>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">Presets: aⁿbⁿ · wcwᴿ · Parens · aⁿb²ⁿ · a²ⁿbⁿ · aⁿbᵐ (n≤m) · aⁿbᵐ (n≥m) · aⁿbⁿcᵐ · aᵐbⁿcⁿ · Balanced ({})</p>
            </div>
            {/* Method 2 */}
            <div className="rounded-2xl border border-orange-900/60 bg-orange-950/20 p-4 text-sm text-slate-400">
              <p className="font-semibold text-orange-300 text-base">📋 Method 2</p>
              <p className="font-medium text-slate-300 mt-0.5">Bulk Import</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>Find <strong className="text-slate-300">📋 Bulk Import Rules</strong> in Machine Builder.</li>
                <li>Paste rules in this format:</li>
              </ol>
              <pre className="mt-2 rounded-xl bg-slate-950 px-3 py-2 font-mono text-[10px] text-cyan-300 overflow-x-auto leading-relaxed">{`q0, a, Z0 -> q0, A Z0
q0, b, A  -> q1, e
q1, e, Z0 -> q_accept, Z0`}</pre>
              <ol className="mt-2 list-decimal space-y-1 pl-5" start={3}>
                <li>Click <strong className="text-slate-300">Import Rules</strong>.</li>
                <li>Lines with <code>#</code> are comments.</li>
              </ol>
            </div>
            {/* Method 3 */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/20 p-4 text-sm text-slate-400">
              <p className="font-semibold text-slate-200 text-base">✏️ Method 3</p>
              <p className="font-medium text-slate-300 mt-0.5">Manual Entry</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>Find <strong className="text-slate-300">Add Transition Rule</strong> in Machine Builder.</li>
                <li>Fill: State · Input · Stack Top · Next State · Push.</li>
                <li>Click <strong className="text-slate-300">Add Rule</strong>. Repeat per rule.</li>
                <li>Use <strong className="text-slate-300">Undo Last Rule</strong> or 🗑 to fix mistakes.</li>
              </ol>
            </div>
          </div>

          {/* Run steps - below the 3 columns */}
          <div className="mt-5 rounded-2xl border border-slate-700/50 bg-slate-800/30 px-5 py-4 text-sm text-slate-400">
            <strong className="text-slate-300">▶ Running a Simulation:</strong>
            <div className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
              <span>1. Enter a test string in <strong className="text-slate-300">Test String</strong>.</span>
              <span>2. Click <strong className="text-slate-300">Load String</strong> to reset tape &amp; stack.</span>
              <span>3. Use <strong className="text-slate-300">Step</strong> for one transition at a time.</span>
              <span>4. Use <strong className="text-slate-300">Play / Pause</strong> to auto-run or pause.</span>
              <span>5. Watch the <strong className="text-slate-300">Status bar</strong> at the bottom.</span>
              <span>6. Click <strong className="text-slate-300">Reset Machine</strong> to start over.</span>
            </div>
          </div>
        </div>

        {/* Non-overlapping full-width Status Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 border-t border-slate-800 bg-slate-900/90 px-6 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <span className="text-sm text-slate-300">Machine Status:</span>
          <span
            className={`text-lg font-bold uppercase tracking-wider ${
              status === "Accepted"
                ? "text-green-400"
                : status === "Rejected"
                  ? "text-red-400"
                  : status === "Running"
                    ? "text-cyan-400"
                    : "text-white"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/20">
            <h2 className="text-2xl font-semibold">Machine Builder</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300">
                Start State
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                  value={startState}
                  onChange={(e) => setStartState(e.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Accept States
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                  value={acceptStatesText}
                  onChange={(e) => setAcceptStatesText(e.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Initial Stack Symbol
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                  value={initialStackSymbol}
                  onChange={(e) => setInitialStackSymbol(e.target.value)}
                />
              </label>
            </div>

            {/* Preset Templates */}
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/30 p-5">
              <h3 className="text-xl font-semibold">⚡ Quick Load Preset</h3>
              <p className="mt-1 text-sm text-slate-400">Select a preset to instantly load all rules and settings.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <select
                  className="flex-1 min-w-[200px] rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                >
                  <option value="">-- Select a preset --</option>
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedPreset}
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={loadPreset}
                >
                  Load Preset
                </button>
              </div>
            </div>

            {/* Bulk Import */}
            <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/30 p-5">
              <h3 className="text-xl font-semibold">📋 Bulk Import Rules</h3>
              <p className="mt-1 text-sm text-slate-400">
                Paste all rules at once. One rule per line in format:
                <code className="ml-1 rounded bg-slate-800 px-1 py-0.5 text-cyan-300 text-xs">currentState, input, stackTop -&gt; nextState, pushSymbols</code>
              </p>
              <p className="mt-1 text-xs text-slate-500">Use <code>e</code> for epsilon. Lines starting with <code>#</code> are ignored as comments.</p>
              <textarea
                className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-cyan-500"
                rows={5}
                value={bulkText}
                onChange={(e) => { setBulkText(e.target.value); setBulkError(""); setBulkSuccess(""); }}
                placeholder={`# Example: aⁿbⁿ rules\nq0, a, Z0 -> q0, A Z0\nq0, a, A -> q0, A A\nq0, b, A -> q1, e\nq1, b, A -> q1, e\nq1, e, Z0 -> q_accept, Z0`}
              />
              {bulkError && <p className="mt-2 text-sm text-red-400">{bulkError}</p>}
              {bulkSuccess && <p className="mt-2 text-sm text-green-400">{bulkSuccess}</p>}
              <button
                type="button"
                disabled={!bulkText.trim()}
                className="mt-3 inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={importBulk}
              >
                Import Rules
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/30 p-5">
              <h3 className="text-xl font-semibold">Add Transition Rule</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Current State
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                    value={newRule.currentState}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        currentState: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Input Symbol
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                    value={newRule.inputSymbol}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        inputSymbol: e.target.value,
                      }))
                    }
                    placeholder="e for epsilon"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Stack Top Symbol
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                    value={newRule.stackTop}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        stackTop: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Next State
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                    value={newRule.nextState}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        nextState: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                  Symbols to Push / Pop
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                    value={newRule.pushSymbols}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        pushSymbols: e.target.value,
                      }))
                    }
                    placeholder="E.g., A B or A,B to push. e for no push."
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  onClick={addRule}
                >
                  Add Rule
                </button>
                <button
                  type="button"
                  disabled={rules.length === 0}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setRules((prev) => prev.slice(0, -1))}
                >
                  Undo Last Rule
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold">Transition Rules</h3>
              <div className="mt-4 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/40">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Current</th>
                      <th className="px-4 py-3">Input</th>
                      <th className="px-4 py-3">Stack Top</th>
                      <th className="px-4 py-3">Next</th>
                      <th className="px-4 py-3">Push/Pop</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {rules.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-5 text-center text-slate-500"
                        >
                          No transition rules defined yet.
                        </td>
                      </tr>
                    ) : (
                      rules.map((rule, index) => (
                        <tr key={`${rule.currentState}-${index}`}>
                          <td className="px-4 py-3">{rule.currentState}</td>
                          <td className="px-4 py-3">{rule.inputSymbol}</td>
                          <td className="px-4 py-3">{rule.stackTop}</td>
                          <td className="px-4 py-3">{rule.nextState}</td>
                          <td className="px-4 py-3">
                            {rule.pushSymbols || "POP"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setRules((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                              title="Delete Rule"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/20">
              <h2 className="text-2xl font-semibold mb-4">State Diagram</h2>
              <StateDiagram rules={rules} currentState={currentState} startState={startState} acceptStates={acceptStates} />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-900/20">
              <h2 className="text-2xl font-semibold">Simulation</h2>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <label className="space-y-2 text-sm text-slate-300">
                  Test String
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-500"
                    value={inputField}
                    onChange={(e) => setInputField(e.target.value)}
                    placeholder="Enter input string"
                  />
                </label>
                <button
                  type="button"
                  className="h-fit rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  onClick={loadString}
                >
                  Load String
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/30 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Tape
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {inputString.split("").map((char, index) => (
                      <span
                        key={`${char}-${index}`}
                        className={`rounded-2xl border px-4 py-2 text-lg font-medium ${index === pointer ? "border-cyan-400 bg-cyan-500/15 text-cyan-300" : "border-slate-700 bg-slate-950 text-slate-200"}`}
                      >
                        {char}
                      </span>
                    ))}
                    {inputString === "" && (
                      <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-500">
                        Empty input
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/30 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Stack
                  </p>
                  <div className="mt-4 flex min-h-[220px] flex-col items-center justify-end gap-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                    {stack.length === 0 ? (
                      <span className="text-slate-500">Stack is empty</span>
                    ) : (
                      [...stack].reverse().map((symbol, index) => (
                        <div
                          key={`${symbol}-${index}`}
                          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-center font-medium text-slate-100"
                        >
                          {symbol}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/30 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Current State</p>
                  <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-xl font-semibold text-white">
                    {currentState}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Next Input</p>
                  <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-xl font-semibold text-white">
                    {currentInputChar || "ε"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-700"
                    onClick={handleStep}
                  >
                    Step
                  </button>
                  <button
                    type="button"
                    className={`rounded-2xl px-5 py-3 font-semibold transition ${playActive ? "bg-orange-500 text-slate-950 hover:bg-orange-400" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"}`}
                    onClick={() => {
                      if (status === "Rejected" || status === "Accepted") {
                        return;
                      }
                      setPlayActive((prev) => !prev);
                      if (status === "Idle") {
                        setStatus("Running");
                      }
                    }}
                  >
                    {playActive ? "Pause" : "Play"}
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-700"
                  onClick={resetSimulation}
                >
                  Reset Machine
                </button>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
