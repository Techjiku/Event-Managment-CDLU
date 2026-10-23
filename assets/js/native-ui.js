// Small browser-native replacements for the former SweetAlert2 and confetti CDN helpers.
(function () {
    function textFrom(value) {
        const element = document.createElement('div');
        element.innerHTML = value == null ? '' : String(value);
        return element.textContent || element.innerText || '';
    }

    window.Swal = {
        fire: async function (titleOrOptions, text, icon) {
            const options = typeof titleOrOptions === 'object'
                ? titleOrOptions
                : { title: titleOrOptions, text: text, icon: icon };
            const message = [options.title, options.text || options.html]
                .filter(Boolean)
                .map(textFrom)
                .join('\n\n');

            if (options.showCancelButton) {
                return {
                    isConfirmed: window.confirm(message),
                    isDismissed: false
                };
            }

            if (options.showConfirmButton !== false && !options.timer) {
                window.alert(message);
            }

            return {
                isConfirmed: true,
                isDismissed: false
            };
        }
    };

    window.NativeUI = {
        celebrate: function () {
            const burst = document.createElement('div');
            burst.setAttribute('aria-hidden', 'true');
            burst.style.cssText = [
                'position:fixed', 'inset:0', 'pointer-events:none', 'z-index:9999',
                'background:radial-gradient(circle, transparent 0 35%, rgba(245,158,11,.18) 36%, transparent 58%)',
                'animation:native-ui-celebrate .7s ease-out forwards'
            ].join(';');
            document.body.appendChild(burst);
            window.setTimeout(function () {
                burst.remove();
            }, 800);
        }
    };

    const style = document.createElement('style');
    style.textContent = '@keyframes native-ui-celebrate { from { opacity: 1; transform: scale(.7); } to { opacity: 0; transform: scale(1.4); } }';
    document.head.appendChild(style);
})();
