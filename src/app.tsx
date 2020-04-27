/** @jsx createElement */

import { render, createElement } from './index';


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
