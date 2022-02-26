// [reference link](https://blog.51cto.com/u_15414551/4400113)
/*
A-  思路
这个问题其实涉及到OSG中的两个问题：多边形分格化和几何图元遍历。

  1) 多边形分格化
  在OpenGL/OSG中，由于效率的原因，默认是直接显示的简单的凸多边形。如果直接强行显示凹多边形，渲染结果是不确定的。
  所以对于复杂的凹多边形，需要将其分解成简单的凸多边形，这个过程就是多边形分格化。
  在OSG中是通过osgUtil::Tessellator类来实现多边形分格化的。

  2) 几何图元遍历
  对于二维的凹多边形，可以有办法计算其面积。但是对于三维空间的凹多边形，计算其面积却很困难。这是因为三维空间凹多边形甚至都有可能不是共面的。
  而我们知道，任何复杂的图形都是通过分解成三角形进行绘制的，只要获取分解成的三角形，计算其面积并相加（空间三角形的面积计算比较简单），就可以得到凹多边形的总面积。
  在OSG中提供了一个用来访问图元的类：osg::PrimitiveFunctor，其继承类osg::TriangleFunctor可以获取其三角面图元。几何体类osg::Geometry提供了遍历几何图元的访问器接口。

B-  实现
其具体实现如下。注意在查找多边形分格化的资料的时候，提到了环绕数和环绕规则的概念。在OSG里面也有相应的参数设置。可惜这一段没有看明白，只能根据仿照例子来设置了。
 */
#include <iostream>
#include <Windows.h>

#include <osgViewer/Viewer>
#include <osgDB/ReadFile>

#include <osgUtil/Tessellator> //
#include <osg/TriangleFunctor>

using namespace std;
using namespace osg;

osg::ref_ptr<osg::Geometry> redPolygon;

//计算空间三角形的面积
double CalTriangleArea(const osg::Vec3& a, const osg::Vec3& b, const osg::Vec3& c)
{
	double area = 0;

	double side[3];//存储三条边的长度;

	side[0] = sqrt(pow(a.x() - b.x(), 2) + pow(a.y() - b.y(), 2) + pow(a.z() - b.z(), 2));
	side[1] = sqrt(pow(a.x() - c.x(), 2) + pow(a.y() - c.y(), 2) + pow(a.z() - c.z(), 2));
	side[2] = sqrt(pow(c.x() - b.x(), 2) + pow(c.y() - b.y(), 2) + pow(c.z() - b.z(), 2));

	//不能构成三角形;
	if (side[0] + side[1] <= side[2] || side[0] + side[2] <= side[1] || side[1] + side[2] <= side[0]) return area;

	//利用海伦公式。s=sqr(p*(p-a)(p-b)(p-c));
	double p = (side[0] + side[1] + side[2]) / 2; //半周长;
	area = sqrt(p*(p - side[0])*(p - side[1])*(p - side[2]));

	return area;
}

//三角面片访问器
struct TriangleAreaFunctor
{
	TriangleAreaFunctor()
	{
		sumArea = new double;
	}

  // (me_add)析构函数
	~TriangleAreaFunctor()
	{
		if (sumArea)
		{
			delete sumArea;
			sumArea = nullptr;
		}
	}

	void operator() (const osg::Vec3& v1, const osg::Vec3& v2, const osg::Vec3& v3) const
	{
		*sumArea = *sumArea + CalTriangleArea(v1, v2, v3);
	}

	double GetSumArea()
	{
		return *sumArea;
	}

protected:
	double *sumArea = nullptr;
};

//
ref_ptr<Geode> createPolygon()
{
	const float wall[6][3] =
	{
		{ -115.54f, 70.873f, -118.952f},
		{ -111.516f, 70.7189f, -71.8492f },
		{ -88.5345f, 70.8667f, -86.3565f },
		{ -64.9495f, 71.8231f, -53.6525f },
		{ -52.9755f, 69.028f, -129.093f },
		{ -89.2272f, 71.1478f, -105.434f }
	};

	//
	ref_ptr<Geode> geode = new Geode();
	redPolygon = new osg::Geometry;

	//
	osg::ref_ptr<osg::Vec3Array> redVex = new osg::Vec3Array;
	redPolygon->setVertexArray(redVex);

	for (int i = 0; i< 6; i++)
	{
		redVex->push_back(osg::Vec3(wall[i][0], wall[i][1], wall[i][2]));
	}

	redPolygon->addPrimitiveSet(new osg::DrawArrays(osg::PrimitiveSet::POLYGON, 0, 6));

	//设置颜色数组
	osg::ref_ptr<osg::Vec4Array> redColors = new osg::Vec4Array;
	redColors->push_back(osg::Vec4(1.0, 0.0, 0.0, 0.5));
	redPolygon->setColorArray(redColors);
	redColors->setBinding(osg::Array::BIND_PER_PRIMITIVE_SET);

	//如果需要透明，则加入这个
	redPolygon->getOrCreateStateSet()->setMode(GL_BLEND, osg::StateAttribute::ON);
	redPolygon->getOrCreateStateSet()->setRenderingHint(osg::StateSet::TRANSPARENT_BIN);

	//创建分格化对象(支持凹多边形)
	osg::ref_ptr<osgUtil::Tessellator> tscx = new osgUtil::Tessellator; // (me_add)在OSG中是通过osgUtil::Tessellator类来实现多边形分格化的。
	//设置分格类型为几何体
	tscx->setTessellationType(osgUtil::Tessellator::TESS_TYPE_GEOMETRY);
	//设置只显示轮廓线为false。设置环绕规则，这里不太懂
	tscx->setWindingType(osgUtil::Tessellator::TESS_WINDING_ODD);
	//使用分格化
	tscx->retessellatePolygons(*(redPolygon.get()));

	geode->addDrawable(redPolygon);

	return geode;
}

int main()
{
	//
	ref_ptr<Group> root = new Group();
	root->getOrCreateStateSet()->setMode(GL_LIGHTING, osg::StateAttribute::OFF | osg::StateAttribute::OVERRIDE);		//关闭默认光照
	root->addChild(createPolygon());

	//
	osgViewer::Viewer viewer;
	viewer.setSceneData(root);
	viewer.setUpViewInWindow(100, 100, 800, 600);
	viewer.run();

	osg::TriangleFunctor<TriangleAreaFunctor> tf;
  // redPolygon 这个是在哪里获取的啊？？？--- 源代码里应该是一个全局变量
	redPolygon->accept(tf); // 这个 accept 没懂啥意思，直接指针就指过来了？？？ 反正就是生效了。
	cout << "面积：" << tf.GetSumArea() << endl;

	return 0;
}s