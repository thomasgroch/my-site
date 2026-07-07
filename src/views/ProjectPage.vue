<script setup>
import ProjectCard from '@/components/ProjectCard.vue'
</script>

<template>
  <div class="flex md:py-16 flex-wrap mx-auto">
    <ProjectCard
      class="text-gray-700 mx-auto my-3 dark:text-neutral-200"
      v-for="(project, index) in projects"
      :item="project"
      :key="index"></ProjectCard>
  </div>
</template>

<script>
export default {
  name: "ProjectPage",
  metaInfo: {
    title: 'Projetos',
  },
  data() {
    return {
      projects: []
    }
  },
  async created() {
    // Optimization: Dynamic import of resume.json reduces initial bundle size
    const data = await import('~/resume.json')
    this.projects = data.default.work
  },
  components: {
    ProjectCard,
  }
}
</script>

