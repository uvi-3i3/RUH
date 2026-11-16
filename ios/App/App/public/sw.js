/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-619edae6'], (function (workbox) { 'use strict';

  importScripts("/sw-notifications.js");
  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "sw-notifications.js",
    "revision": "2f49c19096a1fb3c953917786b3d8613"
  }, {
    "url": "index.html",
    "revision": "f62825c0a4cfd0734af7ce63e7a0f8d1"
  }, {
    "url": "assets/web-FJHVQPuM.js",
    "revision": null
  }, {
    "url": "assets/web-Dc3O5-pr.js",
    "revision": null
  }, {
    "url": "assets/web-DQxHB_Uz.js",
    "revision": null
  }, {
    "url": "assets/web-CJEBeF2g.js",
    "revision": null
  }, {
    "url": "assets/web-C5OT8zpy.js",
    "revision": null
  }, {
    "url": "assets/index-DxL3Q2LC.css",
    "revision": null
  }, {
    "url": "assets/index-DP6gorXx.js",
    "revision": null
  }, {
    "url": "favicon.svg",
    "revision": "7e840862161341271697daa99a40d76b"
  }, {
    "url": "ruh-mark.svg",
    "revision": "1b7d45cd1e1d61b2f37e2a340f6dd04c"
  }, {
    "url": "sw-notifications.js",
    "revision": "2f49c19096a1fb3c953917786b3d8613"
  }, {
    "url": "manifest.webmanifest",
    "revision": "864ead2d6e581c1aeeb2150f3d43f10d"
  }], {});
  workbox.cleanupOutdatedCaches();

}));
