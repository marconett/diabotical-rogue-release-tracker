new MenuScreen({
    game_id: GAME.ids.COMMON,
    name: "credits",
    screen_element: _id("credits_screen"),
    button_element: null,
    fullscreen: false,
    init: () => {
        credits_page.init()
    },
    open_handler: params => {
        set_blur(true);
        historyPushState({
            page: "credits"
        });
        credits_page.on_open()
    }
});
const credits_page = new function() {
    let html = {
        root: null,
        scroll: null,
        list: null,
        screen_actions: null
    };
    let credits = [{
        type: "header",
        title: "The GD Studio"
    }, {
        type: "credit",
        title: "CEO & Lead Designer",
        name: "James Harding",
        br: true
    }, {
        type: "credit",
        title: "CTO & Lead Programmer",
        name: "Firefrog",
        br: false
    }, {
        type: "credit",
        title: "Lead Programmer",
        name: "Juan Fernández",
        br: false
    }, {
        type: "credit",
        title: "Lead Backend Programmer",
        name: "Richard Gansterer",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "Martin Nilsson",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "Adam Rohdin",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "Oskar Schramm",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "Victor Möller",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "Michael Bignet",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "George Chahine",
        br: false
    }, {
        type: "credit",
        title: "Engine Programmer",
        name: "Marcus Cazzola",
        br: false
    }, {
        type: "credit",
        title: "Tech Artist",
        name: "Stefan Hövelmanns",
        br: false
    }, {
        type: "credit",
        title: "UI Programmer",
        name: "Mathias Boman",
        br: true
    }, {
        type: "credit",
        title: "Design & Lead Gameplay Programmer",
        name: "Zohaib Ghani",
        br: false
    }, {
        type: "credit",
        title: "Design & Gameplay Programmer",
        name: "Lukas Edstörm",
        br: false
    }, {
        type: "credit",
        title: "Design & Gameplay Programmer",
        name: "Tobias Rasmusson",
        br: false
    }, {
        type: "credit",
        title: "Design & Gameplay Programmer",
        name: "William Ask",
        br: false
    }, {
        type: "credit",
        title: "Design & Gameplay Programmer",
        name: "Viktor Rissanen",
        br: false
    }, {
        type: "credit",
        title: "Design & Gameplay Programmer",
        name: "Simon Blass",
        br: true
    }, {
        type: "credit",
        title: "Art Director",
        name: "Omar Chaouch",
        br: false
    }, {
        type: "credit",
        title: "Art Director",
        name: "Yoann Ernoult",
        br: false
    }, {
        type: "credit",
        title: "Lead Environment Artist",
        name: "Markus Palvainen",
        br: false
    }, {
        type: "credit",
        title: "Lead Character Artist",
        name: "Carl-Emil Andreasson",
        br: false
    }, {
        type: "credit",
        title: "Character Artist",
        name: "Elina Olsson",
        br: false
    }, {
        type: "credit",
        title: "Environment Artist",
        name: "Lena Fredén",
        br: false
    }, {
        type: "credit",
        title: "Environment Artist",
        name: "Klaudia Milewska",
        br: false
    }, {
        type: "credit",
        title: "Hard Surface Artist",
        name: "Samuel Ehnberg",
        br: false
    }, {
        type: "credit",
        title: "Hard Surface Artist",
        name: "Lewis Palfrey",
        br: false
    }, {
        type: "credit",
        title: "2D Artist",
        name: "Jacob Holliday",
        br: true
    }, {
        type: "credit",
        title: "Lead UI/UX Artist",
        name: "Borys Kuczera",
        br: false
    }, {
        type: "credit",
        title: "UI/UX Artist",
        name: "Sigrid Appleberg",
        br: true
    }, {
        type: "credit",
        title: "Lead VFX Artist",
        name: "Scott McCall Pascual",
        br: false
    }, {
        type: "credit",
        title: "VFX Artist",
        name: "David Tracey",
        br: false
    }, {
        type: "credit",
        title: "VFX Artist",
        name: "Sean Bolster",
        br: true
    }, {
        type: "credit",
        title: "Animation",
        name: "Nicolai Marcher",
        br: false
    }, {
        type: "credit",
        title: "Animation",
        name: "Terese Falk",
        br: true
    }, {
        type: "credit",
        title: "Lead Level Designer",
        name: "Emil Jespersen",
        br: false
    }, {
        type: "credit",
        title: "Level Designer",
        name: "Jere Ahvenkoski",
        br: false
    }, {
        type: "credit",
        title: "Level Designer",
        name: "Roman Kunteleev",
        br: true
    }, {
        type: "credit",
        title: "Audio Engineer",
        name: "Anders Sundbye",
        br: false
    }, {
        type: "credit",
        title: "Audio Engineer",
        name: "Mikael Eriksson",
        br: false
    }, {
        type: "credit",
        title: "Music",
        name: "Seth Everman",
        br: true
    }, {
        type: "credit",
        title: "Lead Community Manager & QA Manager",
        name: "Raven",
        br: false
    }, {
        type: "credit",
        title: "Community & Esports Manager",
        name: "Jake Valianes",
        br: true
    }, {
        type: "credit",
        title: "Marketing Director",
        name: "Bonnie Wui",
        br: false
    }, {
        type: "credit",
        title: "Marketing Manager",
        name: "Sara Jacobson",
        br: false
    }, {
        type: "credit",
        title: "Marketing & QA",
        name: "Rikard Holm Melin",
        br: false
    }, {
        type: "credit",
        title: "Social Media Manager",
        name: "Arvid Vigren",
        br: true
    }, {
        type: "credit",
        title: "Business Man",
        name: "Bob Thomas",
        br: true
    }, {
        type: "header",
        title: "Everlight Studio"
    }, {
        type: "credit",
        title: "Lighting Artist",
        name: "Tomas Lidström",
        br: true
    }, {
        type: "header",
        title: "VFX Apprentice Inc"
    }, {
        type: "credit",
        title: "VFX",
        name: "Jason Keyser",
        br: false
    }, {
        type: "credit",
        title: "VFX",
        name: "Kees Klop",
        br: true
    }, {
        type: "header",
        title: "Additional"
    }, {
        type: "credit",
        title: "Voice Acting",
        name: "Julie Shields",
        br: true
    }, {
        type: "credit",
        title: "Programming",
        name: "Joacim Möller",
        br: true
    }, {
        type: "credit",
        title: "Environment Artist",
        name: "Thomas Meurisse",
        br: false
    }, {
        type: "credit",
        title: "",
        name: "Pau Sánchez",
        br: true
    }, {
        type: "credit",
        title: "Animation",
        name: "Vanessa Sjo",
        br: true
    }, {
        type: "header",
        title: "Localization"
    }, {
        type: "credit",
        title: "Portuguese-Brazil",
        name: "Jean Trindade Pereira",
        br: false
    }, {
        type: "credit",
        title: "",
        name: "Ronald Fontes",
        br: true
    }, {
        type: "credit",
        title: "Polish",
        name: "Mikolaj Kolbuszowski",
        br: true
    }, {
        type: "credit",
        title: "Russian",
        name: "Egor Kotlyarov",
        br: true
    }, {
        type: "credit",
        title: "Japanese",
        name: 'Nobu "uNleashedjp" Tahara',
        br: true
    }, {
        type: "credit",
        title: "French",
        name: "Nicolas Sturla",
        br: true
    }, {
        type: "credit",
        title: "German",
        name: "Bastian Fehl",
        br: true
    }, {
        type: "credit",
        title: "Spanish-Latin America",
        name: "Camilo Brevis",
        br: true
    }, {
        type: "header",
        title: "Playtest & QA"
    }, {
        type: "credit",
        title: "",
        name: "Wiktor Skwarczynski",
        br: false
    }, {
        type: "credit",
        title: "",
        name: "Marcin Mielniczek",
        br: false
    }, {
        type: "credit",
        title: "",
        name: "Jonny Rinkinen",
        br: true
    }];
    this.init = () => {
        html.root = _id("credits_screen");
        html.scroll = _id("credits_scroll_cont");
        html.list = _id("credits_screen_list");
        html.screen_actions = _get_first_with_class_in_parent(html.root, "screen_actions")
    };
    this.on_open = () => {
        Navigation.render_actions([global_action_buttons.back], html.screen_actions);
        render_credits()
    };

    function render_credits() {
        _empty(html.list);
        let fragment = new DocumentFragment;
        for (let c of credits) {
            if (c.type === "header") {
                fragment.appendChild(_createElement("div", "studio_name", c.title))
            } else {
                let title = _createElement("div", "title", c.title);
                let name = _createElement("div", "name", c.name);
                if (c.br) {
                    name.classList.add("br")
                }
                if (c.title) {
                    fragment.appendChild(title)
                }
                fragment.appendChild(name)
            }
        }
        html.list.appendChild(fragment);
        html.list.lastElementChild.classList.add("last");
        refreshScrollbar(html.scroll)
    }
};