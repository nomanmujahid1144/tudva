import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';

const TagInput = () => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tags',
    });

    return (
        <div>
            {fields.map((field, index) => (
                <div key={field.id} className="mb-2">
                    <Controller
                        name={`tags.${index}.tagName`}
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value } }) => (
                            <input
                                type="text"
                                value={value}
                                onChange={onChange}
                                className="form-control form-control-sm d-inline-block w-auto me-2"
                                placeholder="Enter tag"
                            />
                        )}
                    />
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(index)}>
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" className='btn btn-secondary' onClick={() => append({ tagName: '' })}>Add Tag</button>
        </div>
    );
};
export default TagInput;
