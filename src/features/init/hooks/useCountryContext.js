// src/features/init/hooks/useCountryContext.js
import { useState } from 'react';

export default function useCountryContext(pendingDefs) {
    const [plCtxOpen, setPlCtxOpen] = useState(null);
    const [plCtxModes, setPlCtxModes] = useState(() => (pendingDefs || []).map(d => d.context_mode || ''));
    const [plCtxOvrs, setPlCtxOvrs] = useState(() => (pendingDefs || []).map(d => d.contextOverride || ''));

    return {
        plCtxOpen, setPlCtxOpen,
        plCtxModes, setPlCtxModes,
        plCtxOvrs, setPlCtxOvrs
    };
}
