/**
 * @file 节流函数
 * @author dujianhao
 * @date 2018/7/20
 * @param {(Function)} fn
 * @param {number} [delay=0] Unit: ms.
 * @param {boolean} [debounce=false]
 *        true: If call interval less than `delay`, only the last call works.
 *        false: If call interval less than `delay, call works on fixed rate.
 * @return {(Function)} throttled fn.
 */
export default function (fn, delay, debounce) {

    let currCall;
    let lastCall = 0;
    let lastExec = 0;
    let timer = null;
    let diff;
    let scope;
    let args;
    let debounceNextCall;

    delay = delay || 0;

    function exec() {
        lastExec = (new Date()).getTime();
        timer = null;
        fn.apply(scope, args || []);
    }

    const cb = function () {
        currCall = (new Date()).getTime();
        scope = this;
        args = arguments;
        const thisDelay = debounceNextCall || delay;
        const thisDebounce = debounceNextCall || debounce;
        debounceNextCall = null;
        diff = currCall - (thisDebounce ? lastCall : lastExec) - thisDelay;

        clearTimeout(timer);

        if (thisDebounce) {
            timer = setTimeout(exec, thisDelay);
        }
        else {
            if (diff >= 0) {
                exec();
            }
            else {
                timer = setTimeout(exec, -diff);
            }
        }

        lastCall = currCall;
    };

    /**
     * Clear throttle.
     * @public
     */
    cb.clear = function () {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    /**
     * exec fn immediately
     * @public
     */
    cb.flush = function () {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        exec();
    };

    /**
     * Enable debounce once.
     */
    cb.debounceNextCall = function (debounceDelay) {
        debounceNextCall = debounceDelay;
    };

    return cb;
};
