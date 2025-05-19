/**
 * 网站导航前端Vue组件与后台API集成示例
 * 
 * 此文件展示了如何将Vue前端组件与PHP后台API集成
 * 将此代码整合到您的NavPage.vue文件中即可实现动态数据加载
 */

// 导入所需的Vue组件
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 配置API URL（请根据您的实际部署情况修改）
const API_URL = 'http://localhost/navpage-admin/api.php';

// 网站数据
const websites = ref([]);

// 分类数据
const categories = ref([]);

// 当前选中的分类
const activeCategory = ref('all');

// 热搜榜数据（保持原有实现）
const trendingItems = ref([]);
const trendingLoading = ref(true);
const trendingError = ref(null);
let trendingInterval = null;

// 获取所有导航数据（网站和分类）
async function fetchNavigationData() {
  try {
    const response = await fetch(`${API_URL}?action=get_all_data`);
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    const data = await response.json();
    if (data.code === 1 && data.data) {
      // 设置网站数据
      websites.value = data.data.websites;
      
      // 转换分类数据格式
      categories.value = [
        { id: 'all', name: '全部' },
        ...data.data.categories
          .filter(cat => cat.identifier !== 'all')
          .map(cat => ({ id: cat.identifier, name: cat.name }))
      ];
    } else {
      throw new Error('数据格式不正确');
    }
  } catch (error) {
    console.error('获取导航数据失败:', error);
    // 如果API请求失败，可以使用本地备用数据
    // 这里可以保留原有的静态数据作为备用
  }
}

// 热搜榜数据获取（保持原有实现）
async function fetchTrendingData() {
  trendingLoading.value = true;
  trendingError.value = null;
  try {
    const response = await fetch('https://zj.v.api.aa1.cn/api/weibo-rs/');
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    const data = await response.json();
    if (data.code === 1 && data.data && Array.isArray(data.data)) {
      trendingItems.value = data.data.slice(0, 10).map(item => ({
        title: item.title,
        hot: item.hot ? item.hot.toString() : '',
        url: `https://s.weibo.com/weibo?q=%23${encodeURIComponent(item.title)}%23&t=31&band_rank=8&Refer=top`
      }));
    } else {
      throw new Error('数据格式不正确');
    }
  } catch (error) {
    console.error('获取热搜数据失败:', error);
    trendingError.value = '获取热搜数据失败，请稍后再试';
    // 返回备用数据
    trendingItems.value = [
      { title: '微博热搜实时数据1', hot: '5012万', url: '#' },
      { title: '最新科技发布会', hot: '4389万', url: '#' },
      { title: '国内重要新闻动态', hot: '3756万', url: '#' },
      { title: '热门影视作品上映', hot: '2934万', url: '#' },
      { title: '体育赛事最新战报', hot: '2145万', url: '#' }
    ].map(item => ({ ...item, url: `https://s.weibo.com/weibo?q=%23${encodeURIComponent(item.title)}%23&t=31&band_rank=8&Refer=top` }));
  } finally {
    trendingLoading.value = false;
  }
}

// 根据当前分类过滤网站
const filteredWebsites = computed(() => {
  if (activeCategory.value === 'all') {
    return websites.value;
  }
  return websites.value.filter(site => site.category === activeCategory.value);
});

// 切换分类方法
const changeCategory = (category) => {
  activeCategory.value = category;
};

// 组件挂载时获取数据
onMounted(() => {
  // 获取导航数据
  fetchNavigationData();
  
  // 获取热搜数据
  fetchTrendingData();
  trendingInterval = setInterval(fetchTrendingData, 10 * 60 * 1000); // 每10分钟刷新一次
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (trendingInterval) {
    clearInterval(trendingInterval);
  }
});

// 日期相关数据（保持原有实现）
const currentDate = new Date();
const day = currentDate.getDate();
const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][currentDate.getDay()];
const month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear();

// 导出所需的变量和方法
export {
  websites,
  categories,
  activeCategory,
  trendingItems,
  trendingLoading,
  trendingError,
  filteredWebsites,
  changeCategory,
  day,
  weekday,
  month,
  year
};