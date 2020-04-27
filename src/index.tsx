/** @jsx createElement */

import {
	TEXT_ELEMENT,
	DidactElement,
	Props,
	DidactTextElement,
	Instance,
} from './types';

// -----------------------------------

const rootDom = document.getElementById('root');
console.log(rootDom);

window.onload = () => {
  tick();
}

function tick() {
  const elem = <h1>Hello World</h1>;
  console.log('inside tick');
  render(elem, rootDom!);
  setTimeout(() => {
    render(<h2>Ali</h2>, rootDom!);
  }, 2000)
}



// ---------------------------------

let rootInstance: Instance = null;

export function render(element: DidactElement, container: Text | HTMLElement) {
	const prevInstance = rootInstance;
	const nextInstance = reconcile(container, prevInstance, element);
	rootInstance = nextInstance;
}

function reconcile(
	parentDom: Text | HTMLElement,
	instance: Instance,
	element: DidactElement
): Instance {
	if (instance == null) {
		// Create Instance
		const newInstance = instantiate(element);
		parentDom.appendChild(newInstance.dom);
		return newInstance;
	} else if (element == null) {
		// Remove instance
		parentDom.removeChild(instance.dom);
		return null;
	} else if (instance.element.type === element.type) {
		// Update Instance
		updateDomProperties(instance.dom, instance.element.props, element.props);
		instance.childInstances = reconcileChildren(instance, element);
		instance.element = element;
		return instance;
	} else {
		// Replace Instance
		const newInstance = instantiate(element);
		parentDom.replaceChild(newInstance.dom, instance.dom);
		return newInstance;
	}
}

function reconcileChildren(
	instance: Instance,
	element: DidactElement
): Instance[] {
	const dom = instance!.dom;
	const childInstances = instance!.childInstances;
	const nextChildElements: DidactElement[] = element.props.children || [];
	const newChildInstances: Instance[] = [];
	const count = Math.max(childInstances.length, nextChildElements.length);

	for (let i = 0; i < count; i++) {
		const childInstance = childInstances[i];
		const childElement = nextChildElements[i];
		const newChildInstance = reconcile(dom, childInstance, childElement);
		newChildInstances.push(newChildInstance);
	}

	return newChildInstances.filter((ins) => ins != null);
}

function instantiate(element: DidactElement): Instance {
	const { type, props } = element;

	// Create DOM element
	const isTextElement = type === TEXT_ELEMENT;

	const dom = isTextElement
		? document.createTextNode('')
		: document.createElement(type);

	// remove and add Events and attributes
	updateDomProperties(dom, [], props);

	// Instantiate and append children
	const childElements = props.children || [];
	const childInstances = childElements.map(instantiate);
	const childDoms = childInstances.map((childInstance) => childInstance.dom);

	childDoms.forEach((childDom) => dom.appendChild(childDom));

	const instance: Instance = { dom, element, childInstances };
	return instance;
}

function updateDomProperties(
	dom: Text | HTMLElement,
	prevProps: Props,
	nextProps: Props
): void {
	const isEvent = (name: string) => name.startsWith('on');
	const isAttribute = (name: string) => !isEvent(name) && name !== 'children';

	// REMOVE event Listeners
	Object.keys(prevProps)
		.filter(isEvent)
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[name]);
		});

	// Remove Attributes
	Object.keys(prevProps)
		.filter(isAttribute)
		.forEach((name) => {
			dom[name] = null;
		});

	// set new attributes
	Object.keys(nextProps)
		.filter(isAttribute)
		.forEach((name) => {
			dom[name] = nextProps[name];
		});

	// Add event Listeners
	Object.keys(nextProps)
		.filter(isEvent)
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.addEventListener(eventType, nextProps[name]);
		});
}

export function createElement(
	type: string | 'TEXT ELEMENT',
	config: Props,
	...args: DidactElement[]
): DidactElement {
	const props = Object.assign({}, config);

	const emptyChildren: DidactElement[] = [];

	const hasChildren = args.length > 0;
	const rawChildren = hasChildren
		? emptyChildren.concat(...args)
		: emptyChildren;

	props.children = rawChildren
		.filter((c) => c != null)
		.map((c) => (c instanceof Object ? c : createTextElement(c)));

	return { type, props };
}

function createTextElement(value: string): DidactTextElement {
	return createElement(TEXT_ELEMENT, { nodeValue: value }) as DidactTextElement;
}
