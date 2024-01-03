import { nextTick } from '@vue/runtime-core';
import type { SourceType, TableType } from 'nocodb-sdk';
import { LoadingOutlined } from '@ant-design/icons-vue';
import {
ProjectInj,
ProjectRoleInj,
TreeViewInj,
computed,
h,
inject,
navigateTo,
ref,
resolveComponent,
storeToRefs,
useBase,
useBases,
useDialog,
useGlobal,
useNuxtApp,
useRouter,
useTablesStore,
useTabs,
useToggle
} from '#imports';
import type { NcProject } from '#imports';

export default (() => {
const __VLS_setup = async () => {
const indicator = h(LoadingOutlined, {
class: '!text-gray-400',
style: {
fontSize: '0.85rem',
},
spin: true,
});

const router = useRouter();

const route = router.currentRoute;

const { isSharedBase } = storeToRefs(useBase());

const { setMenuContext, openRenameTableDialog, duplicateTable, contextMenuTarget } = inject(TreeViewInj)!;

const base = inject(ProjectInj)!;

const basesStore = useBases();

const { isMobileMode } = useGlobal();

const { createProject: _createProject } = basesStore;

const { bases } = storeToRefs(basesStore);

const { loadProjectTables } = useTablesStore();

const { activeTable } = storeToRefs(useTablesStore());

useTabs();

const editMode = ref(false);

const tempTitle = ref('');

const activeBaseId = ref('');

const isErdModalOpen = ref<boolean>(false);

const input = ref<HTMLInputElement>();

const baseRole = inject(ProjectRoleInj);

const { activeProjectId } = storeToRefs(useBases());

const { baseUrl } = useBase();

const { $e } = useNuxtApp();

const isOptionsOpen = ref(false);
const isBasesOptionsOpen = ref<Record<string, boolean>>({});

const activeKey = ref<string[]>([]);
const [searchActive] = useToggle();
const filterQuery = ref('');
const keys = ref<Record<string, number>>({});
const isTableDeleteDialogVisible = ref(false);
const isProjectDeleteDialogVisible = ref(false);

// If only base is open, i.e in case of docs, base view is open and not the page view
const baseViewOpen = computed(() => {
const routeNameSplit = String(route.value?.name).split('baseId-index-index');
if (routeNameSplit.length <= 1) return false;

const routeNameAfterProjectView = routeNameSplit[routeNameSplit.length - 1];
return routeNameAfterProjectView.split('-').length === 2 || routeNameAfterProjectView.split('-').length === 1;
});

const showBaseOption = computed(() => {
return ['airtableImport', 'csvImport', 'jsonImport', 'excelImport'].some((permission) => isUIAllowed(permission));
});

function enableEditMode() {
editMode.value = true;
tempTitle.value = base.value.title!;
nextTick(() => {
input.value?.focus();
input.value?.select();
input.value?.scrollIntoView();
});
}

defineExpose({
enableEditMode,
});

function openTableCreateDialog(sourceIndex?: number | undefined) {
const isOpen = ref(true);
let sourceId = base.value!.sources?.[0].id;
if (typeof sourceIndex === 'number') {
sourceId = base.value!.sources?.[sourceIndex].id;
}

if (!sourceId || !base.value?.id) return;

const { close } = useDialog(resolveComponent('DlgTableCreate'), {
'modelValue': isOpen,
sourceId, // || sources.value[0].id,
'baseId': base.value!.id,
'onCreate': closeDialog,
'onUpdate:modelValue': () => closeDialog(),
});

function closeDialog(table?: TableType) {
isOpen.value = false;

if (!table) return;

base.value.isExpanded = true;

if (!activeKey.value || !activeKey.value?.includes(`collapse-${sourceId}`)) {
activeKey.value?.push(`collapse-${sourceId}`);
}

// TODO: Better way to know when the table node dom is available
setTimeout(() => {
const newTableDom = document.querySelector(`[data-table-id="${table.id}"]`);
if (!newTableDom) return;

newTableDom?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}, 1000);

close(480);
}
}

function openTableRenameDialog(sourceIndex?: number | undefined) {
const source = typeof sourceIndex === 'number' && base.value!.sources?.[sourceIndex];
if (!source) return;

$e('c:ws:rename');

const isOpen = ref(true);

const { close } = useDialog(resolveComponent('DlgWsRename'), {
'modelValue': isOpen,
'baseId': base.value.id,
'sourceId': source.id,
'currentTitle': source.alias,
'onUpdate:modelValue': closeDialog,
});

function closeDialog() {
isOpen.value = false;

close(480);
}
}

async function onProjectClick(base: NcProject, ignoreNavigation?: boolean, toggleIsExpanded?: boolean) {
if (!base) {
return;
}

if (!toggleIsExpanded) $e('c:base:open');

ignoreNavigation = isMobileMode.value || ignoreNavigation;
toggleIsExpanded = isMobileMode.value || toggleIsExpanded;

base.isExpanded = true;

const isProjectPopulated = basesStore.isProjectPopulated(base.id!);

if (!isProjectPopulated) base.isLoading = true;

if (!ignoreNavigation) {
await navigateTo(
baseUrl({
id: base.id!,
type: 'database',
isSharedBase: isSharedBase.value,
})
);
}

if (!isProjectPopulated) {
await loadProjectTables(base.id!);
}

if (!isProjectPopulated) {
const updatedProject = bases.value.get(base.id!)!;
updatedProject.isLoading = false;
}
}

function openErdView(source: SourceType) {
$e('c:project:relation');

const isOpen = ref(true);

const { close } = useDialog(resolveComponent('DlgProjectErd'), {
'modelValue': isOpen,
'sourceId': source!.id,
'onUpdate:modelValue': () => closeDialog(),
'baseId': base.value.id,
});

function closeDialog() {
isOpen.value = false;

close(480);
}
}

const contextMenuBase = computed(() => {
if (contextMenuTarget.type === 'source') {
return contextMenuTarget.value;
} else if (contextMenuTarget.type === 'table') {
const source = base.value?.sources?.find((b) => b.id === contextMenuTarget.value.source_id);
if (source) return source;
}
return null;
});

watch(
() => activeTable.value?.id,
async () => {
if (!activeTable.value) return;

const sourceId = activeTable.value.source_id;
if (!sourceId) return;

activeKey.value = [`collapse-${sourceId}`];
},
{
immediate: true,
}
);

onKeyStroke('Escape', () => {
if (isOptionsOpen.value) {
isOptionsOpen.value = false;
}

for (const key of Object.keys(isBasesOptionsOpen.value)) {
isBasesOptionsOpen.value[key] = false;
}
});

function tableDelete() {
isTableDeleteDialogVisible.value = true;
$e('c:table:delete');
}

onMounted(() => {
base.value.isExpanded = true;
});
const isUIAclModalOpen = ref(false);
const activedSourceId = ref('');

function openAcl(sourceId: string | undefined) {
if (!sourceId) {
return;
}
activedSourceId.value = sourceId;
isUIAclModalOpen.value = true;
}

function atUpdateModalVis(evt: boolean) {
isUIAclModalOpen.value = evt;
}
const __VLS_publicComponent = (await import('vue')).defineComponent({
setup() {
return {
...({
enableEditMode,
}),
};
},
});

const __VLS_componentsOption = {};

let __VLS_name!: 'FolderTree';
function __VLS_template() {
let __VLS_ctx!: InstanceType<import('./__VLS_types.js').PickNotAny<typeof __VLS_publicComponent, new () => {}>> & InstanceType<import('./__VLS_types.js').PickNotAny<typeof __VLS_internalComponent, new () => {}>> & {};
/* Components */
let __VLS_localComponents!: NonNullable<typeof __VLS_internalComponent extends { components: infer C; } ? C : {}> & typeof __VLS_componentsOption & typeof __VLS_ctx;
let __VLS_otherComponents!: typeof __VLS_localComponents & import('./__VLS_types.js').GlobalComponents;
let __VLS_own!: import('./__VLS_types.js').SelfComponent<typeof __VLS_name, typeof __VLS_internalComponent & typeof __VLS_publicComponent & (new () => { $slots: typeof __VLS_slots; }) >;
let __VLS_components!: typeof __VLS_otherComponents & Omit<typeof __VLS_own, keyof typeof __VLS_otherComponents>;
/* Style Scoped */
type __VLS_StyleScopedClasses = {} &
{ 'ant-collapse-item-active'?: boolean; } &
{ 'ant-collapse-header'?: boolean; };
let __VLS_styleScopedClasses!: __VLS_StyleScopedClasses | keyof __VLS_StyleScopedClasses | (keyof __VLS_StyleScopedClasses)[];
/* CSS variable injection */
/* CSS variable injection end */
let __VLS_templateComponents!: {} &
import('./__VLS_types.js').WithComponent<'NcDropdown', typeof __VLS_components, 'NcDropdown'> &
import('./__VLS_types.js').WithComponent<'ASpin', typeof __VLS_components, 'ASpin', 'aSpin', 'a-spin'> &
import('./__VLS_types.js').WithComponent<'ACollapse', typeof __VLS_components, 'ACollapse', 'aCollapse', 'a-collapse'> &
import('./__VLS_types.js').WithComponent<'GeneralIcon', typeof __VLS_components, 'GeneralIcon'> &
import('./__VLS_types.js').WithComponent<'ACollapsePanel', typeof __VLS_components, 'ACollapsePanel', 'aCollapsePanel', 'a-collapse-panel'> &
import('./__VLS_types.js').WithComponent<'GeneralBaseLogo', typeof __VLS_components, 'GeneralBaseLogo'> &
import('./__VLS_types.js').WithComponent<'NcButton', typeof __VLS_components, 'NcButton'> &
import('./__VLS_types.js').WithComponent<'NcMenu', typeof __VLS_components, 'NcMenu'> &
import('./__VLS_types.js').WithComponent<'NcMenuItem', typeof __VLS_components, 'NcMenuItem'> &
import('./__VLS_types.js').WithComponent<'NcDivider', typeof __VLS_components, 'NcDivider'> &
import('./__VLS_types.js').WithComponent<'DashboardTreeViewBaseOptions', typeof __VLS_components, 'DashboardTreeViewBaseOptions'> &
import('./__VLS_types.js').WithComponent<'DashboardTreeViewTableList', typeof __VLS_components, 'DashboardTreeViewTableList'> &
import('./__VLS_types.js').WithComponent<'DlgTableDelete', typeof __VLS_components, 'DlgTableDelete'> &
import('./__VLS_types.js').WithComponent<'GeneralModal', typeof __VLS_components, 'GeneralModal'> &
import('./__VLS_types.js').WithComponent<'LazyDashboardSettingsErd', typeof __VLS_components, 'LazyDashboardSettingsErd'> &
import('./__VLS_types.js').WithComponent<'DashboardSettingsFolderUiAcl', typeof __VLS_components, 'DashboardSettingsFolderUiAcl'>;
__VLS_components.NcDropdown; __VLS_components.NcDropdown; __VLS_components.NcDropdown; __VLS_components.NcDropdown;
// @ts-ignore
[NcDropdown, NcDropdown, NcDropdown, NcDropdown,];
__VLS_components.ASpin; __VLS_components.aSpin; __VLS_components['a-spin'];
// @ts-ignore
[ASpin,];
__VLS_components.ACollapse; __VLS_components.ACollapse; __VLS_components.aCollapse; __VLS_components.aCollapse; __VLS_components['a-collapse']; __VLS_components['a-collapse'];
// @ts-ignore
[ACollapse, ACollapse,];
__VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon; __VLS_components.GeneralIcon;
// @ts-ignore
[GeneralIcon, GeneralIcon, GeneralIcon, GeneralIcon, GeneralIcon, GeneralIcon, GeneralIcon, GeneralIcon, GeneralIcon,];
__VLS_components.ACollapsePanel; __VLS_components.ACollapsePanel; __VLS_components.aCollapsePanel; __VLS_components.aCollapsePanel; __VLS_components['a-collapse-panel']; __VLS_components['a-collapse-panel'];
// @ts-ignore
[ACollapsePanel, ACollapsePanel,];
__VLS_components.GeneralBaseLogo;
// @ts-ignore
[GeneralBaseLogo,];
__VLS_components.NcButton; __VLS_components.NcButton;
// @ts-ignore
[NcButton, NcButton,];
__VLS_components.NcMenu; __VLS_components.NcMenu; __VLS_components.NcMenu; __VLS_components.NcMenu;
// @ts-ignore
[NcMenu, NcMenu, NcMenu, NcMenu,];
__VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem; __VLS_components.NcMenuItem;
// @ts-ignore
[NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem, NcMenuItem,];
__VLS_components.NcDivider; __VLS_components.NcDivider; __VLS_components.NcDivider; __VLS_components.NcDivider;
// @ts-ignore
[NcDivider, NcDivider, NcDivider, NcDivider,];
__VLS_components.DashboardTreeViewBaseOptions;
// @ts-ignore
[DashboardTreeViewBaseOptions,];
__VLS_components.DashboardTreeViewTableList;
// @ts-ignore
[DashboardTreeViewTableList,];
__VLS_components.DlgTableDelete;
// @ts-ignore
[DlgTableDelete,];
__VLS_components.GeneralModal; __VLS_components.GeneralModal; __VLS_components.GeneralModal; __VLS_components.GeneralModal;
// @ts-ignore
[GeneralModal, GeneralModal, GeneralModal, GeneralModal,];
__VLS_components.LazyDashboardSettingsErd;
// @ts-ignore
[LazyDashboardSettingsErd,];
__VLS_components.DashboardSettingsFolderUiAcl;
// @ts-ignore
[DashboardSettingsFolderUiAcl,];
{
__VLS_templateComponents.NcDropdown;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcDropdown>) = { trigger: ((['contextmenu'])), overlayClassName: ("nc-dropdown-tree-view-context-menu"), 'overlay-class-name': ("nc-dropdown-tree-view-context-menu"), };
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("ml-3 mr-2 nc-base-sub-menu rounded-md"), dataTestid: ((`nc-sidebar-base-${__VLS_ctx.base.title}`)), 'data-testid': ((`nc-sidebar-base-${__VLS_ctx.base.title}`)), dataBaseId: ((__VLS_ctx.base.id)), 'data-base-id': ((__VLS_ctx.base.id)), };
({ active: __VLS_ctx.base.isExpanded });
__VLS_styleScopedClasses = ({ active: base.isExpanded });
// @ts-ignore
[base, base, base,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = {
class: (({
'bg-violet-100 !text-primary active': __VLS_ctx.activeProjectId === __VLS_ctx.base.id && __VLS_ctx.baseViewOpen && !__VLS_ctx.isMobileMode,
'hover:bg-violet-100': !(__VLS_ctx.activeProjectId === __VLS_ctx.base.id && __VLS_ctx.baseViewOpen),
})), dataTestid: ((`nc-sidebar-base-title-${__VLS_ctx.base.title}`)), 'data-testid': ((`nc-sidebar-base-title-${__VLS_ctx.base.title}`)),
};
__VLS_styleScopedClasses = ({
'bg-violet-100 !text-primary active': activeProjectId === base.id && baseViewOpen && !isMobileMode,
'hover:bg-violet-100': !(activeProjectId === base.id && baseViewOpen),
});
type __VLS_0 = JSX.IntrinsicElements['div'];
const __VLS_1: import('./__VLS_types.js').EventObject<typeof undefined, 'click', {}, __VLS_0['onClick']> = {
click: $event => {
__VLS_ctx.onProjectClick(__VLS_ctx.base);
}
};
// @ts-ignore
[activeProjectId, base, baseViewOpen, isMobileMode, activeProjectId, base, baseViewOpen, base, onProjectClick, base,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("flex items-center select-none pl-3 h-full"), };
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:base:emojiSelect']);
if (__VLS_ctx.base.isLoading) {
// @ts-ignore
[base,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.ASpin>) = { class: ("!ml-1.25 !flex !flex-row !items-center !my-0.5 w-8"), indicator: ((__VLS_ctx.indicator)), };
// @ts-ignore
[indicator,];
}
}
{
({} as JSX.IntrinsicElements).svg;
({} as JSX.IntrinsicElements).svg;
(__VLS_x as JSX.IntrinsicElements)['svg'] = { xmlns: ("http://www.w3.org/2000/svg"), height: ("18"), width: ("18"), viewBox: ("0 0 512 512"), };
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { class: ("fa-secondary"), opacity: ("0.4"), fill: ("currentColor"), d: ("M336.4 12.9C400.2 34 453 79.5 483.5 138.4c5.2 10.1-2.5 21.6-13.8 21.6H265.2c-12.3 0-20-13.3-13.9-24l67-116c3.6-6.3 11.1-9.4 18-7.1zM0 256c0-50.9 14.9-98.3 40.5-138.2c6.1-9.5 19.9-8.6 25.6 1.2L168.2 296c6.2 10.7-1.5 24-13.9 24H20.5c-7.3 0-13.7-4.9-15.2-12.1C1.8 291.2 0 273.8 0 256zM256 512c-4 0-7.9-.1-11.9-.3c-11.3-.5-17.5-12.9-11.8-22.8L334.5 312c6.2-10.7 21.6-10.7 27.7 0l66.9 115.9c3.6 6.3 2.6 14.3-2.9 19.2C381.1 487.5 321.4 512 256 512z"), };
}
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { class: ("fa-primary"), opacity: ("1"), fill: ("currentColor"), d: ("M256 0c4 0 7.9 .1 11.9 .3c11.3 .5 17.4 12.9 11.8 22.8L177.5 200c-6.2 10.7-21.6 10.7-27.7 0L82.8 84.1c-3.6-6.3-2.6-14.3 2.9-19.2C130.9 24.5 190.6 0 256 0zM193.6 492c-3.6 6.3-11.1 9.4-18 7.1C111.8 478 59 432.5 28.5 373.6C23.3 363.5 31 352 42.3 352H246.8c12.3 0 20 13.3 13.9 24l-67 116zm277.9-97.8c-6.1 9.5-19.9 8.6-25.6-1.2L343.8 216c-6.2-10.7 1.5-24 13.9-24H491.5c7.3 0 13.7 4.9 15.2 12.1c3.5 16.8 5.3 34.1 5.3 51.9c0 50.9-14.9 98.3-40.5 138.2z"), };
}
}
}
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("pl-2 flex-grow"), };
(__VLS_ctx.$t('title.workspaceHome'));
// @ts-ignore
[$t,];
{
({} as JSX.IntrinsicElements).span;
({} as JSX.IntrinsicElements).span;
(__VLS_x as JSX.IntrinsicElements)['span'] = {};
((__VLS_ctx.base?.sources?.length || 1) - 1);
// @ts-ignore
[base,];
}
}
{
({} as JSX.IntrinsicElements).svg;
({} as JSX.IntrinsicElements).svg;
(__VLS_x as JSX.IntrinsicElements)['svg'] = { xmlns: ("http://www.w3.org/2000/svg"), width: ("20"), height: ("20"), viewBox: ("0 0 256 256"), };
{
({} as JSX.IntrinsicElements).g;
({} as JSX.IntrinsicElements).g;
(__VLS_x as JSX.IntrinsicElements)['g'] = { fill: ("currentColor"), };
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { d: ("M216 115.54V208a8 8 0 0 1-8 8h-48a8 8 0 0 1-8-8v-48a8 8 0 0 0-8-8h-32a8 8 0 0 0-8 8v48a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-92.46a8 8 0 0 1 2.62-5.92l80-75.54a8 8 0 0 1 10.77 0l80 75.54a8 8 0 0 1 2.61 5.92Z"), opacity: (".1"), };
}
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { opacity: (".4"), d: ("m218.83 103.77l-80-75.48a1.14 1.14 0 0 1-.11-.11a16 16 0 0 0-21.53 0l-.11.11l-79.91 75.48A16 16 0 0 0 32 115.55V208a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48h32v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-92.45a16 16 0 0 0-5.17-11.78ZM208 208h-48v-48a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v48H48v-92.45l.11-.1L128 40l79.9 75.43l.11.1Z"), };
}
}
}
}
{
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("pt-2"), };
}
if (__VLS_ctx.base.id && !__VLS_ctx.base.isLoading) {
// @ts-ignore
[base, base,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { key: ("g1"), class: ("overflow-x-hidden transition-max-height"), };
({ 'max-h-0': !__VLS_ctx.base.isExpanded });
__VLS_styleScopedClasses = ({ 'max-h-0': !base.isExpanded });
// @ts-ignore
[base,];
if (__VLS_ctx.base && __VLS_ctx.base?.sources) {
// @ts-ignore
[base, base,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("flex-1 overflow-y-auto overflow-x-hidden flex flex-col"), };
({ 'mb-[20px]': __VLS_ctx.isSharedBase });
__VLS_styleScopedClasses = ({ 'mb-[20px]': isSharedBase });
// @ts-ignore
[isSharedBase,];
if (__VLS_ctx.base?.sources?.slice(1).filter((el) => el.enabled)?.length) {
// @ts-ignore
[base,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("transition-height duration-200"), };
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("border-none sortable-list"), };
for (const [source, sourceIndex] of (await import('./__VLS_types.js')).getVForSourceType(__VLS_ctx.base.sources)) {
// @ts-ignore
[base,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { key: ((`source-${source.id}`)), class: ("mt-2"), };
if (sourceIndex === 0) {
}
else if (source && source.enabled) {
{
__VLS_templateComponents.ACollapse;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.ACollapse>) = { activeKey: ((__VLS_ctx.activeKey)), class: ("!mx-0 !px-0 nc-sidebar-source-node mt-0.5"), expandIconPosition: ("left"), 'expand-icon-position': ("left"), accordion: (true), bordered: ((false)), ghost: (true), };
([
{
'hidden': __VLS_ctx.searchActive && !!__VLS_ctx.filterQuery,
'!bg-slate-100/80 actived-panel-header': __VLS_ctx.activeKey?.includes(`collapse-${source.id}`),
},
]);
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:source:toggle-expand']);
// @ts-ignore
[activeKey, searchActive, filterQuery, activeKey,];
__VLS_styleScopedClasses = ([
{
'hidden': searchActive && !!filterQuery,
'!bg-slate-100/80 actived-panel-header': activeKey?.includes(`collapse-${source.id}`),
},
]);
{
({} as JSX.IntrinsicElements).template;
({} as JSX.IntrinsicElements).template;
(__VLS_x as JSX.IntrinsicElements)['template'] = {};
const __VLS_2 = new __VLS_templateComponents.ACollapse({ activeKey: ((__VLS_ctx.activeKey)), class: ("!mx-0 !px-0 nc-sidebar-source-node mt-0.5"), expandIconPosition: ("left"), 'expand-icon-position': ("left"), accordion: (true), bordered: ((false)), ghost: (true), });
const __VLS_3 = __VLS_templateComponents.ACollapse({ activeKey: ((__VLS_ctx.activeKey)), class: ("!mx-0 !px-0 nc-sidebar-source-node mt-0.5"), expandIconPosition: ("left"), 'expand-icon-position': ("left"), accordion: (true), bordered: ((false)), ghost: (true), });
// @ts-ignore
[activeKey, activeKey,];
let __VLS_4!: import('./__VLS_types.js').ExtractComponentSlots<import('./__VLS_types.js').PickNotAny<typeof __VLS_2, typeof __VLS_3>>;
const { isActive } = __VLS_4.expandIcon;
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("nc-sidebar-expand nc-sidebar-node-btn h-9 !flex items-center"), };
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("triangleFill"), class: ("nc-sidebar-source-node-btns opacity-40 xs:visible !mt-1 cursor-pointer transform transition-transform duration-500 h-2 w-2 text-slate-500 rotate-90"), };
({ '!rotate-180': isActive });
__VLS_styleScopedClasses = ({ '!rotate-180': isActive });
}
}
}
{
__VLS_templateComponents.ACollapsePanel;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.ACollapsePanel>) = { key: ((`collapse-${source.id}`)), };
{
({} as JSX.IntrinsicElements).template;
({} as JSX.IntrinsicElements).template;
(__VLS_x as JSX.IntrinsicElements)['template'] = {};
const __VLS_5 = new __VLS_templateComponents.ACollapsePanel({ key: ((`collapse-${source.id}`)), });
const __VLS_6 = __VLS_templateComponents.ACollapsePanel({ key: ((`collapse-${source.id}`)), });
let __VLS_7!: import('./__VLS_types.js').ExtractComponentSlots<import('./__VLS_types.js').PickNotAny<typeof __VLS_5, typeof __VLS_6>>;
__VLS_7.header;
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("nc-sidebar-node min-w-20 h-10 w-full flex flex-row group"), };
if (sourceIndex === 0) {
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("source-context flex items-center gap-2 text-gray-800 nc-sidebar-node-title"), };
type __VLS_8 = JSX.IntrinsicElements['div'];
const __VLS_9: import('./__VLS_types.js').EventObject<typeof undefined, 'contextmenu', {}, __VLS_8['onContextmenu']> = {
contextmenu: $event => {
__VLS_ctx.setMenuContext('source', source);
}
};
// @ts-ignore
[setMenuContext,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralBaseLogo>) = { class: ("min-w-4 !xs:(min-w-4.25 w-4.25 text-sm)"), };
}
(__VLS_ctx.$t('general.default'));
// @ts-ignore
[$t,];
}
}
else {
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("source-context flex flex-grow items-center gap-1.75 text-gray-800 min-w-1/20 max-w-full"), };
type __VLS_10 = JSX.IntrinsicElements['div'];
const __VLS_11: import('./__VLS_types.js').EventObject<typeof undefined, 'contextmenu', {}, __VLS_10['onContextmenu']> = {
contextmenu: $event => {
__VLS_ctx.setMenuContext('source', source);
}
};
// @ts-ignore
[setMenuContext,];
if (__VLS_ctx.activeKey?.includes(`collapse-${source.id}`)) {
// @ts-ignore
[activeKey,];
{
({} as JSX.IntrinsicElements).svg;
({} as JSX.IntrinsicElements).svg;
(__VLS_x as JSX.IntrinsicElements)['svg'] = { xmlns: ("http://www.w3.org/2000/svg"), width: ("18"), height: ("18"), viewBox: ("0 0 24 24"), };
{
({} as JSX.IntrinsicElements).g;
({} as JSX.IntrinsicElements).g;
(__VLS_x as JSX.IntrinsicElements)['g'] = { fill: ("none"), stroke: ("#8F71F3"), strokeLinecap: ("round"), 'stroke-linecap': ("round"), strokeLinejoin: ("round"), 'stroke-linejoin': ("round"), strokeWidth: ("2"), 'stroke-width': ("2"), };
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { d: ("m6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"), };
}
{
({} as JSX.IntrinsicElements).circle;
(__VLS_x as JSX.IntrinsicElements)['circle'] = { cx: ("14"), cy: ("15"), r: ("1"), };
}
}
}
}
else {
{
({} as JSX.IntrinsicElements).svg;
({} as JSX.IntrinsicElements).svg;
(__VLS_x as JSX.IntrinsicElements)['svg'] = { xmlns: ("http://www.w3.org/2000/svg"), width: ("18"), height: ("18"), viewBox: ("0 0 24 24"), };
{
({} as JSX.IntrinsicElements).g;
({} as JSX.IntrinsicElements).g;
(__VLS_x as JSX.IntrinsicElements)['g'] = { fill: ("none"), stroke: ("#718097"), strokeLinecap: ("round"), 'stroke-linecap': ("round"), strokeLinejoin: ("round"), 'stroke-linejoin': ("round"), strokeWidth: ("2"), 'stroke-width': ("2"), };
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { d: ("M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"), };
}
{
({} as JSX.IntrinsicElements).circle;
(__VLS_x as JSX.IntrinsicElements)['circle'] = { cx: ("12"), cy: ("13"), r: ("2"), };
}
{
({} as JSX.IntrinsicElements).path;
(__VLS_x as JSX.IntrinsicElements)['path'] = { d: ("M12 15v5"), };
}
}
}
}
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { dataTestid: ((`nc-sidebar-base-${source.alias}`)), 'data-testid': ((`nc-sidebar-base-${source.alias}`)), class: ("nc-sidebar-node-title flex capitalize text-ellipsis overflow-hidden select-none"), style: (({ wordBreak: 'keep-all', whiteSpace: 'nowrap', display: 'inline' })), };
(source.alias || '');
}
}
}
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("flex flex-row items-center pr-3"), };
{
__VLS_templateComponents.NcDropdown;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcDropdown>) = { visible: ((__VLS_ctx.isBasesOptionsOpen[source!.id!])), trigger: ((['click'])), };
const __VLS_12 = new __VLS_templateComponents.NcDropdown({ visible: ((__VLS_ctx.isBasesOptionsOpen[source!.id!])), trigger: ((['click'])), });
const __VLS_13 = __VLS_templateComponents.NcDropdown({ visible: ((__VLS_ctx.isBasesOptionsOpen[source!.id!])), trigger: ((['click'])), });
let __VLS_14!: import('./__VLS_types.js').PickNotAny<typeof __VLS_12, typeof __VLS_13>;
type __VLS_15 = import('./__VLS_types.js').InstanceProps<typeof __VLS_14, typeof __VLS_templateComponents.NcDropdown>;
const __VLS_16: import('./__VLS_types.js').EventObject<typeof __VLS_14, 'update:visible', typeof __VLS_templateComponents.NcDropdown, __VLS_15['onUpdate:visible']> = {
'update:visible': $event => {
__VLS_ctx.isBasesOptionsOpen[source!.id!] = $event;
}
};
// @ts-ignore
[isBasesOptionsOpen, isBasesOptionsOpen, isBasesOptionsOpen, isBasesOptionsOpen,];
{
__VLS_templateComponents.NcButton;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcButton>) = { class: ("nc-sidebar-node-btn opacity-0 group-hover:opacity-100"), type: ("text"), size: ("xxsmall"), };
({ '!text-black !opacity-100 !bg-slate-200': __VLS_ctx.isBasesOptionsOpen[source!.id!] });
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:source:options']);
// @ts-ignore
[isBasesOptionsOpen,];
__VLS_styleScopedClasses = ({ '!text-black !opacity-100 !bg-slate-200': isBasesOptionsOpen[source!.id!] });
const __VLS_17 = new __VLS_templateComponents.NcButton({ class: ("nc-sidebar-node-btn opacity-0 group-hover:opacity-100"), type: ("text"), size: ("xxsmall"), });
const __VLS_18 = __VLS_templateComponents.NcButton({ class: ("nc-sidebar-node-btn opacity-0 group-hover:opacity-100"), type: ("text"), size: ("xxsmall"), });
let __VLS_19!: import('./__VLS_types.js').PickNotAny<typeof __VLS_17, typeof __VLS_18>;
type __VLS_20 = import('./__VLS_types.js').InstanceProps<typeof __VLS_19, typeof __VLS_templateComponents.NcButton>;
const __VLS_21: import('./__VLS_types.js').EventObject<typeof __VLS_19, 'click', typeof __VLS_templateComponents.NcButton, __VLS_20['onClick']> = {
click: $event => {
__VLS_ctx.isBasesOptionsOpen[source!.id!] = !__VLS_ctx.isBasesOptionsOpen[source!.id!];
}
};
// @ts-ignore
[isBasesOptionsOpen, isBasesOptionsOpen,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("threeDotHorizontal"), class: ("text-xl w-4.75"), };
}
}
{
({} as JSX.IntrinsicElements).template;
({} as JSX.IntrinsicElements).template;
(__VLS_x as JSX.IntrinsicElements)['template'] = {};
const __VLS_22 = new __VLS_templateComponents.NcDropdown({ visible: ((__VLS_ctx.isBasesOptionsOpen[source!.id!])), trigger: ((['click'])), });
const __VLS_23 = __VLS_templateComponents.NcDropdown({ visible: ((__VLS_ctx.isBasesOptionsOpen[source!.id!])), trigger: ((['click'])), });
// @ts-ignore
[isBasesOptionsOpen, isBasesOptionsOpen,];
let __VLS_24!: import('./__VLS_types.js').ExtractComponentSlots<import('./__VLS_types.js').PickNotAny<typeof __VLS_22, typeof __VLS_23>>;
__VLS_24.overlay;
{
__VLS_templateComponents.NcMenu;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenu>) = {
class: ("nc-scrollbar-md !px-1.5"), style: (({
maxHeight: '70vh',
overflow: 'overlay',
})),
};
const __VLS_25 = new __VLS_templateComponents.NcMenu({
class: ("nc-scrollbar-md !px-1.5"), style: (({
maxHeight: '70vh',
overflow: 'overlay',
})),
});
const __VLS_26 = __VLS_templateComponents.NcMenu({
class: ("nc-scrollbar-md !px-1.5"), style: (({
maxHeight: '70vh',
overflow: 'overlay',
})),
});
let __VLS_27!: import('./__VLS_types.js').PickNotAny<typeof __VLS_25, typeof __VLS_26>;
type __VLS_28 = import('./__VLS_types.js').InstanceProps<typeof __VLS_27, typeof __VLS_templateComponents.NcMenu>;
const __VLS_29: import('./__VLS_types.js').EventObject<typeof __VLS_27, 'click', typeof __VLS_templateComponents.NcMenu, __VLS_28['onClick']> = {
click: $event => {
__VLS_ctx.isBasesOptionsOpen[source!.id!] = false;
}
};
// @ts-ignore
[isBasesOptionsOpen,];
if (__VLS_ctx.isUIAllowed('tableCreate', { roles: __VLS_ctx.baseRole })) {
// @ts-ignore
[isUIAllowed, baseRole,];
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = { key: ("rename"), };
const __VLS_30 = new __VLS_templateComponents.NcMenuItem({ key: ("rename"), });
const __VLS_31 = __VLS_templateComponents.NcMenuItem({ key: ("rename"), });
let __VLS_32!: import('./__VLS_types.js').PickNotAny<typeof __VLS_30, typeof __VLS_31>;
type __VLS_33 = import('./__VLS_types.js').InstanceProps<typeof __VLS_32, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_34: import('./__VLS_types.js').EventObject<typeof __VLS_32, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_33['onClick']> = {
click: $event => {
__VLS_ctx.openTableRenameDialog(sourceIndex);
}
};
// @ts-ignore
[openTableRenameDialog,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("edit"), class: ("leading-5"), style: ({}), };
}
(__VLS_ctx.$t('general.rename'));
// @ts-ignore
[$t,];
}
}
if (__VLS_ctx.isUIAllowed('tableCreate', { roles: __VLS_ctx.baseRole })) {
// @ts-ignore
[isUIAllowed, baseRole,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcDivider>) = {};
}
}
if (__VLS_ctx.isUIAllowed('tableCreate', { roles: __VLS_ctx.baseRole })) {
// @ts-ignore
[isUIAllowed, baseRole,];
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = { key: ("createTable"), };
const __VLS_35 = new __VLS_templateComponents.NcMenuItem({ key: ("createTable"), });
const __VLS_36 = __VLS_templateComponents.NcMenuItem({ key: ("createTable"), });
let __VLS_37!: import('./__VLS_types.js').PickNotAny<typeof __VLS_35, typeof __VLS_36>;
type __VLS_38 = import('./__VLS_types.js').InstanceProps<typeof __VLS_37, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_39: import('./__VLS_types.js').EventObject<typeof __VLS_37, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_38['onClick']> = {
click: $event => {
__VLS_ctx.openTableCreateDialog(sourceIndex);
}
};
// @ts-ignore
[openTableCreateDialog,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("plus"), class: ("text-xl leading-5"), style: ({}), };
}
(__VLS_ctx.$t('activity.createTable'));
// @ts-ignore
[$t,];
}
}
if (__VLS_ctx.showBaseOption) {
// @ts-ignore
[showBaseOption,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.DashboardTreeViewBaseOptions>) = { base: ((__VLS_ctx.base)), source: ((source)), };
// @ts-ignore
[base,];
}
}
if (__VLS_ctx.showBaseOption) {
// @ts-ignore
[showBaseOption,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcDivider>) = {};
}
}
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = { key: ("erd"), };
const __VLS_40 = new __VLS_templateComponents.NcMenuItem({ key: ("erd"), });
const __VLS_41 = __VLS_templateComponents.NcMenuItem({ key: ("erd"), });
let __VLS_42!: import('./__VLS_types.js').PickNotAny<typeof __VLS_40, typeof __VLS_41>;
type __VLS_43 = import('./__VLS_types.js').InstanceProps<typeof __VLS_42, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_44: import('./__VLS_types.js').EventObject<typeof __VLS_42, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_43['onClick']> = {
click: $event => {
__VLS_ctx.openErdView(source);
}
};
// @ts-ignore
[openErdView,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("flex gap-2 items-center"), };
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:source:erd']);
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("erd"), };
}
(__VLS_ctx.$t('title.relations'));
// @ts-ignore
[$t,];
}
}
if (__VLS_ctx.isUIAllowed('tableCreate', { roles: __VLS_ctx.baseRole })) {
// @ts-ignore
[isUIAllowed, baseRole,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcDivider>) = {};
}
}
if (__VLS_ctx.isUIAllowed('tableCreate', { roles: __VLS_ctx.baseRole })) {
// @ts-ignore
[isUIAllowed, baseRole,];
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = { key: ("privilegesMgmt"), };
const __VLS_45 = new __VLS_templateComponents.NcMenuItem({ key: ("privilegesMgmt"), });
const __VLS_46 = __VLS_templateComponents.NcMenuItem({ key: ("privilegesMgmt"), });
let __VLS_47!: import('./__VLS_types.js').PickNotAny<typeof __VLS_45, typeof __VLS_46>;
type __VLS_48 = import('./__VLS_types.js').InstanceProps<typeof __VLS_47, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_49: import('./__VLS_types.js').EventObject<typeof __VLS_47, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_48['onClick']> = {
click: $event => {
__VLS_ctx.openAcl(source.id);
}
};
// @ts-ignore
[openAcl,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("flex gap-2 items-center"), };
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:source:erd']);
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("acl"), };
}
(__VLS_ctx.$t('title.privilegesMgmt'));
// @ts-ignore
[$t,];
}
}
}
}
}
}
}
}
}
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { ref: ("menuRefs"), key: ((`sortable-${source.id}-${source.id && source.id in __VLS_ctx.keys ? __VLS_ctx.keys[source.id] : '0'}`)), ncSource: ((source.id)), 'nc-source': ((source.id)), class: ("px-3 pb-3"), };
// @ts-ignore
(__VLS_ctx.menuRefs);
// @ts-ignore
[keys, keys, menuRefs,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.DashboardTreeViewTableList>) = { base: ((__VLS_ctx.base)), sourceIndex: ((sourceIndex)), 'source-index': ((sourceIndex)), };
// @ts-ignore
[base,];
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
{
({} as JSX.IntrinsicElements).template;
({} as JSX.IntrinsicElements).template;
(__VLS_x as JSX.IntrinsicElements)['template'] = {};
const __VLS_50 = new __VLS_templateComponents.NcDropdown({ trigger: ((['contextmenu'])), overlayClassName: ("nc-dropdown-tree-view-context-menu"), 'overlay-class-name': ("nc-dropdown-tree-view-context-menu"), });
const __VLS_51 = __VLS_templateComponents.NcDropdown({ trigger: ((['contextmenu'])), overlayClassName: ("nc-dropdown-tree-view-context-menu"), 'overlay-class-name': ("nc-dropdown-tree-view-context-menu"), });
let __VLS_52!: import('./__VLS_types.js').ExtractComponentSlots<import('./__VLS_types.js').PickNotAny<typeof __VLS_50, typeof __VLS_51>>;
__VLS_52.overlay;
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vIf)(!__VLS_ctx.isSharedBase);
// @ts-ignore
[isSharedBase,];
{
__VLS_templateComponents.NcMenu;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenu>) = { class: ("!py-0 rounded text-sm"), };
if (__VLS_ctx.contextMenuTarget.type === 'base' && __VLS_ctx.base.type === 'database') {
// @ts-ignore
[contextMenuTarget, base,];
}
else if (__VLS_ctx.contextMenuTarget.type === 'source') {
// @ts-ignore
[contextMenuTarget,];
}
else if (__VLS_ctx.contextMenuTarget.type === 'table') {
// @ts-ignore
[contextMenuTarget,];
if (__VLS_ctx.isUIAllowed('tableRename')) {
// @ts-ignore
[isUIAllowed,];
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = {};
const __VLS_53 = new __VLS_templateComponents.NcMenuItem({});
const __VLS_54 = __VLS_templateComponents.NcMenuItem({});
let __VLS_55!: import('./__VLS_types.js').PickNotAny<typeof __VLS_53, typeof __VLS_54>;
type __VLS_56 = import('./__VLS_types.js').InstanceProps<typeof __VLS_55, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_57: import('./__VLS_types.js').EventObject<typeof __VLS_55, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_56['onClick']> = {
click: $event => {
__VLS_ctx.openRenameTableDialog(__VLS_ctx.contextMenuTarget.value, true);
}
};
// @ts-ignore
[openRenameTableDialog, contextMenuTarget,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("nc-base-option-item flex gap-2 items-center"), };
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:table:rename']);
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("edit"), class: ("text-gray-700"), };
}
(__VLS_ctx.$t('general.rename'));
// @ts-ignore
[$t,];
}
}
}
if (__VLS_ctx.isUIAllowed('tableDuplicate') && (__VLS_ctx.contextMenuBase?.is_meta || __VLS_ctx.contextMenuBase?.is_local)) {
// @ts-ignore
[isUIAllowed, contextMenuBase, contextMenuBase,];
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = {};
const __VLS_58 = new __VLS_templateComponents.NcMenuItem({});
const __VLS_59 = __VLS_templateComponents.NcMenuItem({});
let __VLS_60!: import('./__VLS_types.js').PickNotAny<typeof __VLS_58, typeof __VLS_59>;
type __VLS_61 = import('./__VLS_types.js').InstanceProps<typeof __VLS_60, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_62: import('./__VLS_types.js').EventObject<typeof __VLS_60, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_61['onClick']> = {
click: $event => {
__VLS_ctx.duplicateTable(__VLS_ctx.contextMenuTarget.value);
}
};
// @ts-ignore
[duplicateTable, contextMenuTarget,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("nc-base-option-item flex gap-2 items-center"), };
(await import('./__VLS_types.js')).directiveFunction(__VLS_ctx.vE)(['c:table:duplicate']);
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("duplicate"), class: ("text-gray-700"), };
}
(__VLS_ctx.$t('general.duplicate'));
// @ts-ignore
[$t,];
}
}
}
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcDivider>) = {};
}
if (__VLS_ctx.isUIAllowed('table-delete')) {
// @ts-ignore
[isUIAllowed,];
{
__VLS_templateComponents.NcMenuItem;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.NcMenuItem>) = { class: ("!hover:bg-red-50"), };
const __VLS_63 = new __VLS_templateComponents.NcMenuItem({ class: ("!hover:bg-red-50"), });
const __VLS_64 = __VLS_templateComponents.NcMenuItem({ class: ("!hover:bg-red-50"), });
let __VLS_65!: import('./__VLS_types.js').PickNotAny<typeof __VLS_63, typeof __VLS_64>;
type __VLS_66 = import('./__VLS_types.js').InstanceProps<typeof __VLS_65, typeof __VLS_templateComponents.NcMenuItem>;
const __VLS_67: import('./__VLS_types.js').EventObject<typeof __VLS_65, 'click', typeof __VLS_templateComponents.NcMenuItem, __VLS_66['onClick']> = {
click: (__VLS_ctx.tableDelete)
};
// @ts-ignore
[tableDelete,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("nc-base-option-item flex gap-2 items-center text-red-600"), };
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralIcon>) = { icon: ("delete"), };
}
(__VLS_ctx.$t('general.delete'));
// @ts-ignore
[$t,];
}
}
}
}
}
}
}
if (__VLS_ctx.contextMenuTarget.value?.id && __VLS_ctx.base?.id) {
// @ts-ignore
[contextMenuTarget, base,];
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.DlgTableDelete>) = { visible: ((__VLS_ctx.isTableDeleteDialogVisible)), tableId: ((__VLS_ctx.contextMenuTarget.value?.id)), 'table-id': ((__VLS_ctx.contextMenuTarget.value?.id)), baseId: ((__VLS_ctx.base?.id)), 'base-id': ((__VLS_ctx.base?.id)), };
// @ts-ignore
[isTableDeleteDialogVisible, contextMenuTarget, base,];
}
}
{
__VLS_templateComponents.GeneralModal;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralModal>) = { visible: ((__VLS_ctx.isErdModalOpen)), size: ("large"), };
// @ts-ignore
[isErdModalOpen,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("h-[80vh]"), };
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.LazyDashboardSettingsErd>) = { sourceId: ((__VLS_ctx.activeBaseId)), 'source-id': ((__VLS_ctx.activeBaseId)), };
// @ts-ignore
[activeBaseId,];
}
}
}
{
__VLS_templateComponents.GeneralModal;
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.GeneralModal>) = { visible: ((__VLS_ctx.isUIAclModalOpen)), class: ("!w-[60rem]"), closable: (true), };
const __VLS_68 = new __VLS_templateComponents.GeneralModal({ visible: ((__VLS_ctx.isUIAclModalOpen)), class: ("!w-[60rem]"), closable: (true), });
const __VLS_69 = __VLS_templateComponents.GeneralModal({ visible: ((__VLS_ctx.isUIAclModalOpen)), class: ("!w-[60rem]"), closable: (true), });
let __VLS_70!: import('./__VLS_types.js').PickNotAny<typeof __VLS_68, typeof __VLS_69>;
type __VLS_71 = import('./__VLS_types.js').InstanceProps<typeof __VLS_70, typeof __VLS_templateComponents.GeneralModal>;
const __VLS_72: import('./__VLS_types.js').EventObject<typeof __VLS_70, 'update:visible', typeof __VLS_templateComponents.GeneralModal, __VLS_71['onUpdate:visible']> = {
'update:visible': (__VLS_ctx.atUpdateModalVis)
};
// @ts-ignore
[isUIAclModalOpen, isUIAclModalOpen, isUIAclModalOpen, atUpdateModalVis,];
if (__VLS_ctx.isUIAclModalOpen) {
// @ts-ignore
[isUIAclModalOpen,];
{
({} as JSX.IntrinsicElements).div;
({} as JSX.IntrinsicElements).div;
(__VLS_x as JSX.IntrinsicElements)['div'] = { class: ("p-6"), };
{
(__VLS_x as import('./__VLS_types.js').ComponentProps<typeof __VLS_templateComponents.DashboardSettingsFolderUiAcl>) = { sourceId: ((__VLS_ctx.activedSourceId)), 'source-id': ((__VLS_ctx.activedSourceId)), sourceName: ((__VLS_ctx.)), 'source-name': ((__VLS_ctx.)), };
const __VLS_73 = new __VLS_templateComponents.DashboardSettingsFolderUiAcl({ sourceId: ((__VLS_ctx.activedSourceId)), 'source-id': ((__VLS_ctx.activedSourceId)), sourceName: ((__VLS_ctx.)), 'source-name': ((__VLS_ctx.)), });
const __VLS_74 = __VLS_templateComponents.DashboardSettingsFolderUiAcl({ sourceId: ((__VLS_ctx.activedSourceId)), 'source-id': ((__VLS_ctx.activedSourceId)), sourceName: ((__VLS_ctx.)), 'source-name': ((__VLS_ctx.)), });
let __VLS_75!: import('./__VLS_types.js').PickNotAny<typeof __VLS_73, typeof __VLS_74>;
type __VLS_76 = import('./__VLS_types.js').InstanceProps<typeof __VLS_75, typeof __VLS_templateComponents.DashboardSettingsFolderUiAcl>;
const __VLS_77: import('./__VLS_types.js').EventObject<typeof __VLS_75, 'close', typeof __VLS_templateComponents.DashboardSettingsFolderUiAcl, __VLS_76['onClose']> = {
close: $event => {
__VLS_ctx.isUIAclModalOpen = false;
}
};
// @ts-ignore
[activedSourceId, , activedSourceId, , activedSourceId, , isUIAclModalOpen,];
}
}
}
}
if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
__VLS_styleScopedClasses['ml-3'];
__VLS_styleScopedClasses['mr-2'];
__VLS_styleScopedClasses['nc-base-sub-menu'];
__VLS_styleScopedClasses['rounded-md'];
__VLS_styleScopedClasses['cursor-pointer'];
__VLS_styleScopedClasses['pr-4'];
__VLS_styleScopedClasses['text-slate-500'];
__VLS_styleScopedClasses['nc-sidebar-node'];
__VLS_styleScopedClasses['base-title-node'];
__VLS_styleScopedClasses['h-11'];
__VLS_styleScopedClasses['flex-grow'];
__VLS_styleScopedClasses['rounded-md'];
__VLS_styleScopedClasses['group'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['w-full'];
__VLS_styleScopedClasses['pr-1'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['select-none'];
__VLS_styleScopedClasses['pl-3'];
__VLS_styleScopedClasses['h-full'];
__VLS_styleScopedClasses['!ml-1.25'];
__VLS_styleScopedClasses['!flex'];
__VLS_styleScopedClasses['!flex-row'];
__VLS_styleScopedClasses['!items-center'];
__VLS_styleScopedClasses['!my-0.5'];
__VLS_styleScopedClasses['w-8'];
__VLS_styleScopedClasses['fa-secondary'];
__VLS_styleScopedClasses['fa-primary'];
__VLS_styleScopedClasses['pl-2'];
__VLS_styleScopedClasses['flex-grow'];
__VLS_styleScopedClasses['pt-2'];
__VLS_styleScopedClasses['overflow-x-hidden'];
__VLS_styleScopedClasses['transition-max-height'];
__VLS_styleScopedClasses['flex-1'];
__VLS_styleScopedClasses['overflow-y-auto'];
__VLS_styleScopedClasses['overflow-x-hidden'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['flex-col'];
__VLS_styleScopedClasses['transition-height'];
__VLS_styleScopedClasses['duration-200'];
__VLS_styleScopedClasses['border-none'];
__VLS_styleScopedClasses['sortable-list'];
__VLS_styleScopedClasses['mt-2'];
__VLS_styleScopedClasses['!mx-0'];
__VLS_styleScopedClasses['!px-0'];
__VLS_styleScopedClasses['nc-sidebar-source-node'];
__VLS_styleScopedClasses['mt-0.5'];
__VLS_styleScopedClasses['nc-sidebar-expand'];
__VLS_styleScopedClasses['nc-sidebar-node-btn'];
__VLS_styleScopedClasses['h-9'];
__VLS_styleScopedClasses['!flex'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['nc-sidebar-source-node-btns'];
__VLS_styleScopedClasses['opacity-40'];
__VLS_styleScopedClasses['xs:visible'];
__VLS_styleScopedClasses['!mt-1'];
__VLS_styleScopedClasses['cursor-pointer'];
__VLS_styleScopedClasses['transform'];
__VLS_styleScopedClasses['transition-transform'];
__VLS_styleScopedClasses['duration-500'];
__VLS_styleScopedClasses['h-2'];
__VLS_styleScopedClasses['w-2'];
__VLS_styleScopedClasses['text-slate-500'];
__VLS_styleScopedClasses['rotate-90'];
__VLS_styleScopedClasses['nc-sidebar-node'];
__VLS_styleScopedClasses['min-w-20'];
__VLS_styleScopedClasses['h-10'];
__VLS_styleScopedClasses['w-full'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['flex-row'];
__VLS_styleScopedClasses['group'];
__VLS_styleScopedClasses['source-context'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['gap-2'];
__VLS_styleScopedClasses['text-gray-800'];
__VLS_styleScopedClasses['nc-sidebar-node-title'];
__VLS_styleScopedClasses['min-w-4'];
__VLS_styleScopedClasses['!xs:(min-w-4.25'];
__VLS_styleScopedClasses['w-4.25'];
__VLS_styleScopedClasses['text-sm)'];
__VLS_styleScopedClasses['source-context'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['flex-grow'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['gap-1.75'];
__VLS_styleScopedClasses['text-gray-800'];
__VLS_styleScopedClasses['min-w-1/20'];
__VLS_styleScopedClasses['max-w-full'];
__VLS_styleScopedClasses['nc-sidebar-node-title'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['capitalize'];
__VLS_styleScopedClasses['text-ellipsis'];
__VLS_styleScopedClasses['overflow-hidden'];
__VLS_styleScopedClasses['select-none'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['flex-row'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['pr-3'];
__VLS_styleScopedClasses['nc-sidebar-node-btn'];
__VLS_styleScopedClasses['opacity-0'];
__VLS_styleScopedClasses['group-hover:opacity-100'];
__VLS_styleScopedClasses['text-xl'];
__VLS_styleScopedClasses['w-4.75'];
__VLS_styleScopedClasses['nc-scrollbar-md'];
__VLS_styleScopedClasses['!px-1.5'];
__VLS_styleScopedClasses['leading-5'];
__VLS_styleScopedClasses['text-xl'];
__VLS_styleScopedClasses['leading-5'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['gap-2'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['gap-2'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['px-3'];
__VLS_styleScopedClasses['pb-3'];
__VLS_styleScopedClasses['!py-0'];
__VLS_styleScopedClasses['rounded'];
__VLS_styleScopedClasses['text-sm'];
__VLS_styleScopedClasses['nc-base-option-item'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['gap-2'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['text-gray-700'];
__VLS_styleScopedClasses['nc-base-option-item'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['gap-2'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['text-gray-700'];
__VLS_styleScopedClasses['!hover:bg-red-50'];
__VLS_styleScopedClasses['nc-base-option-item'];
__VLS_styleScopedClasses['flex'];
__VLS_styleScopedClasses['gap-2'];
__VLS_styleScopedClasses['items-center'];
__VLS_styleScopedClasses['text-red-600'];
__VLS_styleScopedClasses['h-[80vh]'];
__VLS_styleScopedClasses['!w-[60rem]'];
__VLS_styleScopedClasses['p-6'];
}
declare var __VLS_slots: {};
return __VLS_slots;
}
const __VLS_internalComponent = (await import('vue')).defineComponent({
setup() {
return {
indicator: indicator,
isSharedBase: isSharedBase,
setMenuContext: setMenuContext,
openRenameTableDialog: openRenameTableDialog,
duplicateTable: duplicateTable,
contextMenuTarget: contextMenuTarget,
base: base,
isMobileMode: isMobileMode,
activeBaseId: activeBaseId,
isErdModalOpen: isErdModalOpen,
baseRole: baseRole,
activeProjectId: activeProjectId,
isBasesOptionsOpen: isBasesOptionsOpen,
activeKey: activeKey,
searchActive: searchActive,
filterQuery: filterQuery,
keys: keys,
isTableDeleteDialogVisible: isTableDeleteDialogVisible,
baseViewOpen: baseViewOpen,
showBaseOption: showBaseOption,
openTableCreateDialog: openTableCreateDialog,
openTableRenameDialog: openTableRenameDialog,
onProjectClick: onProjectClick,
openErdView: openErdView,
contextMenuBase: contextMenuBase,
tableDelete: tableDelete,
isUIAclModalOpen: isUIAclModalOpen,
activedSourceId: activedSourceId,
openAcl: openAcl,
atUpdateModalVis: atUpdateModalVis,
};
},
});
return {} as typeof __VLS_publicComponent;
};
return {} as typeof __VLS_setup extends () => Promise<infer T> ? T : never;
})({} as any);
