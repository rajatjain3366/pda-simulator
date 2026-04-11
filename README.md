# Universal PDA Simulator

A React-based Push Down Automaton simulator built with Vite and Tailwind CSS.

## Features

- Dynamic machine builder: Define states, accept states, and initial stack symbol
- Rule editor: Add custom transition rules with push/pop operations
- Visual simulation: Step through input strings with tape and stack visualization
- Auto-play mode: Watch the machine run automatically

## Usage

1. Set machine parameters (start state, accept states, initial stack)
2. Add transition rules using the form
3. Load a test string and step through or play automatically
4. Observe acceptance/rejection based on PDA logic

## Example: Balanced Parentheses

- Start: q0, Accept: q1, Initial Stack: Z0
- Rules: (q0, (, Z0) -> (q0, Z0(), etc.
- Test strings: (), (()), (()())

## Development

```bash
npm install
npm run dev
```
