import {InputWithPath} from '../data/FormItemWithPath';

export function getInputType(inputWithPath: Optional<InputWithPath>): 'html' | 'text' {
    return inputWithPath?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}
