// Delay loading the large phone engine until an engine action is actually used.
// This keeps the initial page responsive while preserving the existing global API
// used by inline handlers in index.html.
let enginePromise;

function loadPhoneEngine() {
    if (!enginePromise) {
        enginePromise = import('./phone_engine.js').then(module => module.PhoneEngine);
    }
    return enginePromise;
}

export const PhoneEngine = new Proxy({}, {
    get(_target, property) {
        if (property === 'then') return undefined;
        return (...args) => loadPhoneEngine().then(engine => {
            const method = engine[property];
            if (typeof method !== 'function') {
                throw new TypeError(`PhoneEngine.${String(property)} is not a function`);
            }
            return method.apply(engine, args);
        });
    },
    set(_target, property, value) {
        loadPhoneEngine().then(engine => { engine[property] = value; });
        return true;
    }
});

export { loadPhoneEngine };
