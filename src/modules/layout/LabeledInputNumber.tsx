import { setDecimalPlacesString } from '@/functions';
import { StyledInputNumber, StyledLabel } from '@/hooks';
import { debounce } from '@mui/material';
import { InputNumberProps } from 'antd';
import React from 'react';

interface LabeledInputNumberProps {
  label?: string;
  inputNumberProps?: InputNumberProps;
  delay?: number;
}

export const LabeledInputNumber: React.FC<LabeledInputNumberProps> = ({
  label,
  inputNumberProps,
  delay = 0,
}) => {
  return (
    <div style={{ position: 'relative' }}>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInputNumber
        value={inputNumberProps?.value as number}
        onChange={
          delay > 0
            ? inputNumberProps?.onChange
              ? debounce(inputNumberProps?.onChange, delay)
              : inputNumberProps?.onChange
            : inputNumberProps?.onChange
        }
        min={inputNumberProps?.min}
        defaultValue={inputNumberProps?.defaultValue}
        controls={inputNumberProps?.controls}
        precision={inputNumberProps?.precision}
        prefix={inputNumberProps?.prefix}
        className="mi-input-number-generic"
        onFocus={inputNumberProps?.onFocus}
        readOnly={inputNumberProps?.readOnly}
        addonAfter={inputNumberProps?.addonAfter}
        formatter={
          inputNumberProps?.readOnly
            ? inputNumberProps?.formatter ||
              ((value) =>
                setDecimalPlacesString(
                  value as number,
                  inputNumberProps?.precision || 0
                ))
            : undefined
        }
        parser={inputNumberProps?.parser}
        style={inputNumberProps?.style}
        decimalSeparator=","
        status={inputNumberProps?.status}
      />
    </div>
  );
};
