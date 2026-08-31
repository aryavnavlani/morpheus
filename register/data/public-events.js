window.PUBLIC_EVENTS =
    Array.isArray(window.EVENTS)
        ? window.EVENTS.map(event => ({
            id: event.id,
            
            eventName:
                event.eventName || "",

            title: event.title,

            shortTitle:
                event.shortTitle ||
                event.title,

            category:
                event.category,

            type:
                event.type,

            summary:
                event.summary || "",

            description:
                event.description || "",

            duration:
                event.duration || "",

            rules:
                Array.isArray(event.rules)
                    ? event.rules
                    : [],

            judging:
                Array.isArray(event.judging)
                    ? event.judging
                    : [],

            additionalInfo:
                Array.isArray(event.notes)
                    ? event.notes
                    : []
        }))
        : [];