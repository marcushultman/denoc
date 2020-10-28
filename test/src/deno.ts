import 'https://deno.land/x/lodash@4.17.19/lodash.js';

export default function () {
  return (window as any)._.lowerCase("deno");
}
