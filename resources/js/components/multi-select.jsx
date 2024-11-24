// components/ui/multi-select.jsx
import { useState } from 'react';
import Select from 'react-select';

export const MultiSelect = ({ options, value, onChange, placeholder, className }) => {
    return (
        <Select
            isMulti
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            classNamePrefix="select"
        />
    );
};