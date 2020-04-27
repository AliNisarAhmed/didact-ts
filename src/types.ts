/** @jsx createElement */

export type DidactElement
  = DidactHTMLElement
  | DidactTextElement;

export type DidactHTMLElement =
  { type: string; props: Props };

export type DidactTextElement = {
  type: typeof TEXT_ELEMENT,
  props: TextElementProps
}

export type Props = {
  children?: Array<DidactElement>;
  [key: string]: any;
}

export interface TextElementProps extends Props {
  nodeValue: string;
}

// instance is used to keep track of the previously rendered elements
export type Instance
  = {
    dom: Text | HTMLElement,  // the actual dom elements rendered
    element: DidactElement,
    childInstances: Instance[]
  } | null;

export const TEXT_ELEMENT = 'TEXT ELEMENT';
