import * as os from 'os';
import { btoa, atob } from './ignored';
import nodeOrDeno from './node';
import {
  deepStrictEqual,
  ok
} from 'assert';
import 'inspector';
import 'path';

deepStrictEqual(atob(btoa(os.platform())), os.platform());

const env = nodeOrDeno();
ok(env === 'node' || env === 'deno');
console.log('ok from', env);
