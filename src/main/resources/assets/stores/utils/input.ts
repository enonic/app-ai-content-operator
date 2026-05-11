import type {DataEntryType} from '../../../shared/data/DataEntry';
import type {InputWithPath} from '../data/FormItemWithPath';

export function getInputType(inputWithPath: Optional<InputWithPath>): DataEntryType {
    return inputWithPath?.Input.inputType === 'HtmlArea' ? 'html' : 'text';
}
