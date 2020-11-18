import { Vue } from 'nuxt-property-decorator'
import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import { PageModel } from "~/utils/entities/editor/page"
import { service } from "~/utils"
import { v4 as uuidV4 } from 'uuid'
import cloneDeep from 'lodash/cloneDeep'

/**
 * Query node by id from all sections
 * @param sections
 * @param nodeId
 * @param needContext: If true, just return context for modify
 */
const findNodeByNodeId = (sections, nodeId, needContext) => {
  let node = null
  for (const section of sections) {
    let i = 0
    for (const cur of section.nodes) {
      if (cur.id === nodeId) {
        if (needContext)
          return { nodes: section.nodes, index: i }
        node = cur
        break
      }

      i++
    }
    if (node) break
  }

  return node
}

@Module({
  name: 'editor',
  stateFactory: true,
  namespaced: true,
})
class EditorModule extends VuexModule {
  public page: PageModel | null = null
  public currentPageSectionId: string | null = null
  public currentNodeIds: string[] | null = []

  get currentPage() { return this.page }
  get currentNodesIdsGetter() { return this.currentNodeIds }
  get currentPageSectionIdGetter() { return this.currentPageSectionId }

  get currentNode() {
    if (this.currentNodeIds && this.currentNodeIds.length > 0) {
      const id = this.currentNodeIds[0]
      let node: any = null

      if (!this.page) return node

      node = findNodeByNodeId(this.page.page_section, id, null)
      return node
    }
    return null
  }

  get currentPageSection() {
    if (!this.currentPageSectionId || !this.page || !this.page.page_section) return null
    const sections = this.page.page_section.filter(section => section.id === this.currentPageSectionId)
    if (!sections || sections.length < 1) return null

    return sections[0]
  }

  @Mutation public CHOOSE_PAGE_SECTION(id: string) { this.currentPageSectionId = id }
  @Mutation public GET_PAGE_DETAILS(page: PageModel) { this.page = page }
  @Mutation public ADD_PAGE_SECTION(payload) {
    this.page && this.page.page_section.splice(payload.index + 1, 0, payload.data)
  }
  @Mutation public RESET_ACTIVE() {
    this.currentPageSectionId = null
    this.currentNodeIds = []
  }

  @Mutation public RESET_NODE() {
    this.currentNodeIds = []
  }

  @Mutation public ACTIVE_NODE(payload) {
    this.currentPageSectionId = payload.sectionId

    if (payload.active) {
      this.currentNodeIds = [payload.id]
      return
    }
    this.currentNodeIds = []
  }
  @Mutation public MULTIPLE_ACTIVE_NODE(payload) {
    if (!this.currentNodeIds) this.currentNodeIds = []

    this.currentPageSectionId = payload.sectionId
    const has = this.currentNodeIds.indexOf(payload.id)
    if (payload.active) {
      if (has === -1)
        this.currentNodeIds.push(payload.id)
      return
    }

    if (has !== -1)
      this.currentNodeIds.splice(has, 1)
  }
  @Mutation public ADD_NODE(payload) {
    const section = this.page && this.page.page_section.filter(cur => cur.id === payload.sectionId)
    if (!section || section.length < 1) return

    section[0].nodes.push(payload.node)
  }
  @Mutation public DELETE_NODE(payload) {
    const section = this.page && this.page.page_section.filter(cur => cur.id === payload.sectionId)
    if (!section || section.length < 1) return

    section[0].nodes = section[0].nodes.filter(node => node.id !== payload.nodeId)
  }
  @Mutation public MODIFY_NODE(payload) {
    if (!payload.sectionId && this.page) {
      const res = findNodeByNodeId(this.page.page_section, payload.node.id, true)

      if (res) Vue.set(res.nodes, res.index, payload.node)
      return
    }

    const section = this.page && this.page.page_section.filter(cur => cur.id === payload.sectionId)
    if (!section || section.length < 1) return

    section[0].nodes = section[0].nodes.map(node => {
      if (node.id === payload.node.id)
        return payload.node
      return node
    })
  }

  @Mutation
  public REMOVE_ACTIVE_NODES() {
    const currentNodeIds = this.currentNodeIds
    if (!currentNodeIds || currentNodeIds.length < 0) return

    const section = this.page && this.page.page_section.filter(cur => cur.id === this.currentPageSectionId)

    if (!section || section.length < 1) return

    Vue.set(section[0], 'nodes', section[0].nodes.filter(node => {
      return currentNodeIds.indexOf(node.id as string) === -1
    }))

    this.currentNodeIds = []
  }

  @Action({ rawError: true, commit: 'CHOOSE_PAGE_SECTION' })
  public async choosePageSection(id) {
    return id
  }

  @Action({ rawError: true, commit: 'GET_PAGE_DETAILS' })
  public async getPageDetails(id) {
    const res = await service.editor.getPageDetails(id)
    return res.data.data
  }

  @Action({ rawError: true })
  public async savePageDetails() {
    const page = cloneDeep(this.page)
    if (!page) return
    const id = page.id
    delete page.id
    delete page.key
    delete page.unique_id
    delete page.application_id

    if (!page.type) page.type = 1
    if (!page.direction) page.direction = 'column'
    return await service.editor.savePageDetails(id, page)
  }

  @Action({ rawError: true })
  public async addPageSection({ index, pageId }) {
    const res = await service.editor.addPageSection({
      section_type: 'editor',
      page_id: pageId,
      nodes: [],
    })
    if (res.status === 200)
      this.context.commit('ADD_PAGE_SECTION', { data: res.data.data, index })
    return res
  }

  @Action({ rawError: true, commit: 'ADD_NODE' })
  public async addNode(node) {
    let sectionId = this.currentPageSectionId
    if (!sectionId && this.page)
      sectionId = this.page.page_section[0].id
    node.id = uuidV4() // Generate node id
    return { sectionId, node }
  }

  @Action({ rawError: true, commit: 'DELETE_NODE' })
  public async deleteNode({ sectionId, nodeId }) {
    return { sectionId, nodeId }
  }

  @Action({ rawError: true })
  public async modifyNode({ sectionId, node }) {
    this.context.commit('MODIFY_NODE', { sectionId, node })
  }

  @Action({ rawError: true, commit: 'ACTIVE_NODE' })
  public activeNode({ id, active, sectionId }) {
    return { id, active, sectionId }
  }

  @Action({ rawError: true, commit: 'MULTIPLE_ACTIVE_NODE' })
  public multipleActiveNode({ id, active, sectionId }) {
    return { id, active, sectionId }
  }

  @Action({ commit: 'RESET_ACTIVE' })
  public resetActive() { return }
  @Action({ commit: 'RESET_NODE' })
  public resetNodes() { return }

  @Action({ commit: 'REMOVE_ACTIVE_NODES' })
  public removeActiveNodes() {
    return
  }
}

export default EditorModule
