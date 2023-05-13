function table_response_handler(response) {
    $('#corpus-title').html(response.title);
    return response.data;
}

function generic_line_detail_formatter(index, row) {
    var html = [
        '<div class="table-responsive-sm"><table class="table table-striped">'
    ];

    var rows = {};
    if(!row.analysis) {
        html.push('<tr><td>No details available.</td></tr>');
    } else {
        var first_word = row.analysis[0];
        for (const k in first_word) {
            rows[k] = [];
        }
        for (const word of row.analysis) {
            for (const [k, v] of Object.entries(word)) {
                rows[k].push(v);
            }
        }
        for (const [name, data] of Object.entries(rows)) {
            html.push(`<tr><th scope="row">${name}</th><td>${data.join("</td><td>")}</td></tr>`);
        }
    }
    html.push('</table></div>')
    return html.join("\n");
}

function sanskrit_line_detail_formatter(index, row) {
    var words = [];
    var roots = [];
    var genders = [];
    var cases = [];
    var forms = [];
    var noun_markers = [];

    for (const word of row.analysis) {
        words.push(word.original);
        roots.push(word.root);
        if (word.details !== {}) {
            genders.push(word.details.gender);
            cases.push(word.details.case);
            forms.push(word.details.form);
        } else {
            genders.push("");
            cases.push("");
            forms.push("");
        }
        noun_markers.push(word.is_noun);
    }

    const html = [
        '<div class="table-responsive-sm"><table class="table table-striped">',
        '<tr><th scope="row">Word</th><td>' + words.join("</td><td>") + '</td></tr>',
        '<tr><th scope="row">Root</th><td>' + roots.join("</td><td>") + '</td></tr>',
        '<tr><th scope="row">Gender</th><td>' + genders.join("</td><td>") + '</td></tr>',
        '<tr><th scope="row">Case</th><td>' + cases.join("</td><td>") + '</td></tr>',
        '<tr><th scope="row">Number</th><td>' + forms.join("</td><td>") + '</td></tr>',
        '<tr><th scope="row">Noun?</th><td>' + noun_markers.join("</td><td>") + '</td></tr>',
        '</table></div>',
    ];

    return html.join("\n");
}

function column_marked_formatter(value, row) {
    return value ? '<i class="fa fa-check"></i>' : '';
}

function attach_context_menu(css_selector, menu_options) {
    // NOTE: `context` is a special object defined in Context.js
    // NOTE: Menu options should be compatible with Context.js Options
    // These options should be generated by other JS functions that call this function.
    context.attach(css_selector, menu_options);
}

function entity_formatter(entity, is_unconfirmed = false) {
    // TODO: Should this return object instead of HTML? Construction via JS/jQuery?
    const entity_value = [entity.lemma.lemma, entity.label.label].join('$');

    const li_base_class = "list-group-item";
    // edit-entity context menu will be shown for nodes with `context-node` class
    // we add this class only to the confirmed nodes, since unconfirmed nodes can just be removed
    const li_confirmed_classes = "context-node";
    const li_unconfirmed_classes = "list-group-item-warning unconfirmed-entity";
    const li_class = is_unconfirmed ? li_base_class + " " + li_unconfirmed_classes : li_base_class + " " + li_confirmed_classes;

    const node_hover_text = entity.annotator ? `Node ID: ${entity.id}, Annotator: ${entity.annotator.username}` : `Node ID: ${entity.id}`;
    const lemma_hover_text = `Lexicon ID: ${entity.lemma.id}`;
    const node_label_hover_text = `Label ID: ${entity.label.id}`;

    const entity_html = [
        `<li title="${node_hover_text}" class="${li_class}" data-node-id="${entity.id}" data-annotator-id="${entity.annotator.id}" data-lexicon-id="${entity.lemma.id}" data-node-label-id="${entity.label.id}">`,
        '<div class="row">',
        `<div class="col-sm-4 entity-lemma" title="${lemma_hover_text}">${entity.lemma.lemma}</div>`,
        `<div class="col-sm-4 text-secondary entity-label" title="${node_label_hover_text}">${entity.label.label}</div>`,
        '<div class="col-sm-4">',
        '<span class="float-right">',
        `<input type="checkbox" name="entity" value="${entity_value}" class="mr-5"`,
        ' data-toggle="toggle" data-size="sm" data-on="<i class=\'fa fa-check\'></i>" ',
        ' data-off="<i class=\'fa fa-times\'></i>" data-onstyle="success"',
        ' data-offstyle="danger" checked>',
        '</span>',
        '</div>',
        '</div>',
        '</li>'
    ];
    return entity_html.join("");
}

function unnamed_formatter(line_id, text, unnamed_prefix) {
    const upper_text = text.toUpperCase();
    const pattern = new RegExp('^'+ unnamed_prefix +'[0-9]$');
    if (upper_text.match(pattern)) {
        return upper_text + '-' + line_id;
    }
    return text;
}

function relation_formatter(relation, is_unconfirmed = false) {
    // TODO: Should this return object instead of HTML? Construction via JS/jQuery?
    if (relation.detail == null) {
        relation.detail = "";
    }
    const relation_value = [
        relation.source.id,
        relation.label.id,
        relation.target.id,
        relation.detail,
        relation.source.lemma,
        relation.source.label,
        relation.label.label,
        relation.target.lemma,
        relation.target.label,
    ].join('$');

    const li_base_class = "list-group-item";
    const li_unconfirmed_classes = "list-group-item-warning unconfirmed-relation";
    const li_class = is_unconfirmed ? li_base_class + " " + li_unconfirmed_classes : li_base_class;

    const relation_hover_text = relation.annotator ? `Relation ID: ${relation.id}, Annotator: ${relation.annotator.username}` : `Relation ID: ${relation.id}`;
    const source_node_hover_text = `Source Node ID: ${relation.source.id}`;
    const target_node_hover_text = `Target Node ID: ${relation.target.id}`;
    const relation_label_hover_text = `Label ID: ${relation.label.id}`;

    const relation_html = [
        `<li title="${relation_hover_text}" class="${li_class}">`,
        '<div class="row">',
        '<div class="col-sm">',
        `<span title="${source_node_hover_text}">(<span class="relation-lemma relation-source-lemma">${relation.source.lemma}</span> <span class="text-secondary">:: ${relation.source.label}</span>)</span>`,
        ` <span class="text-muted" title="${relation_label_hover_text}">⊢ [${relation.label.label} (${relation.detail})] →</span> `,
        `<span title="${target_node_hover_text}">(<span class="relation-lemma relation-target-lemma">${relation.target.lemma}</span> <span class="text-secondary">:: ${relation.target.label}</span>)</span>`,
        '</div>',
        '<div class="col-sm-3">',
        '<span class="float-right">',
        `<input type="checkbox" name="relation" value="${relation_value}" class="mr-5"`,
        ' data-toggle="toggle" data-size="sm" data-on="<i class=\'fa fa-check\'></i>" ',
        ' data-off="<i class=\'fa fa-times\'></i>" data-onstyle="success"',
        ' data-offstyle="danger" checked>',
        '</span>',
        '</div>',
        '</div>',
        '</li>'
    ];
    return relation_html.join("");
}

function action_formatter(label, actor_label, actor, is_unconfirmed = false, annotator = "") {
    var action_value = [label, actor_label, actor].join('$');

    const li_base_class = "list-group-item";
    const li_unconfirmed_classes = "list-group-item-warning unconfirmed-action";
    const li_class = is_unconfirmed ? li_base_class + " " + li_unconfirmed_classes : li_base_class;

    var action_html = [
        annotator ? `<li title="${annotator}" class="${li_class}">` : `<li class="${li_class}">`,
        '<div class="row">',
        '<div class="col-sm">',
        `(${label})`,
        ` <span class="text-muted">⊢ [${actor_label}] →</span> `,
        `(${actor})`,
        '</div>',
        '<div class="col-sm-3">',
        '<span class="float-right">',
        `<input type="checkbox" name="action" value="${action_value}" class="mr-5"`,
        ' data-toggle="toggle" data-size="sm" data-on="<i class=\'fa fa-check\'></i>" ',
        ' data-off="<i class=\'fa fa-times\'></i>" data-onstyle="success"',
        ' data-offstyle="danger" checked>',
        '</span>',
        '</div>',
        '</div>',
        '</li>'
    ];
    return action_html.join("");
}

function row_attribute_handler(row, index) {
    return {}
}
