import React, { useState } from 'react';
import { backend } from 'declarations/backend';
import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#32CD32',
  color: 'white',
  '&:hover': {
    backgroundColor: '#28a745',
  },
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      const result = await calculateResult(firstOperand, inputValue, operator);
      setLoading(false);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculateResult = async (firstOperand: number, secondOperand: number, operator: string): Promise<number> => {
    switch (operator) {
      case '+':
        return await backend.add(firstOperand, secondOperand);
      case '-':
        return await backend.subtract(firstOperand, secondOperand);
      case '*':
        return await backend.multiply(firstOperand, secondOperand);
      case '/':
        const result = await backend.divide(firstOperand, secondOperand);
        if (result === null) {
          throw new Error('Division by zero');
        }
        return result;
      default:
        return secondOperand;
    }
  };

  return (
    <div className="calculator">
      <img src="https://upload.wikimedia.org/wikipedia/en/5/55/Bsd_daemon.jpg" alt="BSD Devil Logo" className="logo" />
      <div className="display">
        {loading ? <CircularProgress size={24} color="inherit" /> : display}
      </div>
      <div className="keypad">
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((key) => (
          <StyledButton
            key={key}
            onClick={() => {
              if (key === '=') {
                performOperation('=');
              } else if (['+', '-', '*', '/'].includes(key)) {
                performOperation(key);
              } else if (key === '.') {
                inputDecimal();
              } else {
                inputDigit(key);
              }
            }}
            className="key"
          >
            {key}
          </StyledButton>
        ))}
      </div>
      <StyledButton onClick={clear} className="key" style={{ gridColumn: 'span 4' }}>
        Clear
      </StyledButton>
    </div>
  );
};

export default App;